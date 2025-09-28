import os
import io
import json
import requests
import fitz  # PyMuPDF
from PIL import Image, ImageEnhance, ImageFilter
from google.cloud import vision
from google.oauth2 import service_account
from datetime import datetime
import re

# ========================================
# CONFIGURATION
# ========================================
# Clear any existing Google Cloud credentials
for key in list(os.environ.keys()):
    if key.startswith('GOOGLE_') or key.startswith('GCLOUD_'):
        del os.environ[key]

# Google Vision API credentials
VISION_CREDENTIALS_FILE = "northern-window-vision.json"

# Verify credentials
if not os.path.exists(VISION_CREDENTIALS_FILE):
    print("❌ ERROR: northern-window-vision.json file not found!")
    exit(1)

try:
    with open(VISION_CREDENTIALS_FILE, 'r') as f:
        cred_data = json.load(f)
        print(f"🔑 Using Google Cloud Project: {cred_data.get('project_id', 'Unknown')}")
except Exception as e:
    print(f"❌ Error reading credentials: {e}")
    exit(1)

# Gemini API (for enhancement only)
GEMINI_API_KEY = "AIzaSyBexWIe3_Stau2pzckyhQWfsxFTSRfBTS4"
GEMINI_TEXT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

# Folders
INPUT_FOLDER = "pdf"
OUTPUT_FOLDER = "hybrid_vision_analysis"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)


def preprocess_image(image):
    """Preprocess image for better OCR results."""
    if image.mode != 'L':
        image = image.convert('L')
    
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.8)
    
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(1.5)
    
    return image


def pdf_to_images_pymupdf(pdf_path):
    """Convert PDF pages to PIL images using PyMuPDF."""
    doc = fitz.open(pdf_path)
    images = []
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(matrix=fitz.Matrix(3, 3))
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))
        img = preprocess_image(img)
        images.append(img)
    
    doc.close()
    return images


def extract_text_with_vision_api(image):
    """Extract text from image using Google Vision API."""
    try:
        credentials = service_account.Credentials.from_service_account_file(VISION_CREDENTIALS_FILE)
        credentials = credentials.with_quota_project("northern-window-473416-i0")
        
        client = vision.ImageAnnotatorClient(
            credentials=credentials,
            client_options={"quota_project_id": "northern-window-473416-i0"}
        )
        
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        content = img_byte_arr.getvalue()
        
        vision_image = vision.Image(content=content)
        response = client.text_detection(image=vision_image)
        
        if response.error.message:
            raise Exception(f'Vision API Error: {response.error.message}')
        
        full_text = response.full_text_annotation.text if response.full_text_annotation else ""
        
        annotations = []
        for annotation in response.text_annotations:
            if annotation == response.text_annotations[0]:
                continue
            
            annotations.append({
                "text": annotation.description,
                "confidence": 1.0,
                "bounding_poly": [
                    {"x": vertex.x, "y": vertex.y} for vertex in annotation.bounding_poly.vertices
                ]
            })
        
        return full_text, annotations
        
    except Exception as e:
        print(f"❌ Vision API Error: {e}")
        return "", []


def analyze_business_plan_with_vision(text):
    """Analyze business plan using Vision API extracted text with rule-based parsing."""
    
    # Clean and normalize text
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = text.strip()
    
    # Initialize analysis structure
    analysis = {
        "businessCanvas": {
            "keyPartners": {
                "description": "Key partners and suppliers identified from business plan",
                "details": ""
            },
            "keyActivities": {
                "description": "Core business activities and operations",
                "details": ""
            },
            "keyResources": {
                "description": "Essential resources required for business operations",
                "details": ""
            },
            "valueProposition": {
                "description": "Core value delivered to customers",
                "details": ""
            },
            "customerRelationships": {
                "description": "Customer relationship management approach",
                "details": ""
            },
            "channels": {
                "description": "Sales and distribution channels",
                "details": ""
            },
            "customerSegments": {
                "description": "Target customer segments",
                "details": ""
            },
            "costStructure": {
                "description": "Major cost components",
                "details": ""
            },
            "revenueStreams": {
                "description": "Revenue generation methods",
                "details": ""
            }
        },
        "businessAnalysis": {
            "strengths": [],
            "weaknesses": [],
            "opportunities": [],
            "threats": []
        },
        "trafficLightScore": "YELLOW",
        "feedbackSuggestions": [],
        "localImpactMapping": ""
    }
    
    # Extract key information using pattern matching
    text_lower = text.lower()
    
    # Extract business name
    business_name = extract_pattern(text, r'(?:business name|name of.*business)[:\s]*([^\n]+)', "Unknown Business")
    
    # Extract product/service
    product_service = extract_pattern(text, r'(?:product|service|main product)[^\n]*[:\s]*([^\n]+)', "")
    
    # Extract customer segments
    customers = extract_pattern(text, r'(?:customers?|target|market)[^\n]*[:\s]*([^\n]+)', "")
    
    # Extract problem being solved
    problem = extract_pattern(text, r'(?:problem|issue|challenge)[^\n]*[:\s]*([^\n]+)', "")
    
    # Extract competitors
    competitors = extract_pattern(text, r'(?:competitor|competition|rival)[^\n]*[:\s]*([^\n]+)', "")
    
    # Fill BMC sections based on extracted information
    analysis["businessCanvas"]["valueProposition"]["details"] = f"Business: {business_name}. {product_service}. Addressing: {problem}"
    analysis["businessCanvas"]["customerSegments"]["details"] = customers
    analysis["businessCanvas"]["keyActivities"]["details"] = f"Production and sale of {product_service}"
    analysis["businessCanvas"]["channels"]["details"] = extract_pattern(text, r'(?:sell|sales|channel|distribution)[^\n]*[:\s]*([^\n]+)', "Direct sales")
    
    # Basic SWOT analysis from text
    if "natural" in text_lower and "handmade" in text_lower:
        analysis["businessAnalysis"]["strengths"].append("Natural ingredients appeal to health-conscious consumers")
        analysis["businessAnalysis"]["opportunities"].append("Growing demand for natural and organic products")
    
    if "competitor" in text_lower or "competition" in text_lower:
        analysis["businessAnalysis"]["threats"].append("Competition from existing market players")
    
    if "small" in text_lower or "local" in text_lower:
        analysis["businessAnalysis"]["weaknesses"].append("Limited scale and resources as small business")
        analysis["businessAnalysis"]["opportunities"].append("Strong local market presence potential")
    
    # Extract financial information
    cost_info = extract_pattern(text, r'(?:cost|price|expense)[^\n]*[:\s]*([^\n]+)', "")
    if cost_info:
        analysis["businessCanvas"]["costStructure"]["details"] = cost_info
    
    # Basic recommendations
    analysis["feedbackSuggestions"] = [
        "Develop a comprehensive marketing strategy to reach target customers effectively",
        "Conduct detailed competitor analysis to identify unique positioning opportunities", 
        "Create detailed financial projections with clear cost structure and revenue forecasts"
    ]
    
    # Local impact assessment
    analysis["localImpactMapping"] = "Business has potential for positive local economic impact through job creation and supporting local supply chains"
    
    return analysis


def extract_pattern(text, pattern, default=""):
    """Extract information using regex pattern."""
    import re
    match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
    return match.group(1).strip() if match else default


def enhance_with_gemini(vision_analysis, original_text):
    """Try to enhance the analysis with Gemini, fallback to Vision-only if unavailable."""
    
    print("🤖 Attempting to enhance analysis with Gemini...")
    
    prompt = f"""Enhance this business analysis with more detailed insights. Keep the same JSON structure but improve the content quality and details.

Original Text: {original_text[:2000]}...

Current Analysis: {json.dumps(vision_analysis, indent=2)}

Please enhance each section with more specific, actionable insights while maintaining the exact same JSON structure. Focus on:
1. More detailed BMC section descriptions
2. Specific SWOT points based on the business plan
3. Actionable recommendations with timelines
4. Quantified local impact assessment

Return only the enhanced JSON structure."""

    headers = {'Content-Type': 'application/json'}
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 3000,
        }
    }
    
    try:
        response = requests.post(
            f"{GEMINI_TEXT_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload,
            timeout=30  # Shorter timeout for quick fallback
        )
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                enhanced_text = result['candidates'][0]['content']['parts'][0]['text']
                
                # Try to parse enhanced JSON
                start_idx = enhanced_text.find('{')
                end_idx = enhanced_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx > start_idx:
                    json_text = enhanced_text[start_idx:end_idx]
                    enhanced_analysis = json.loads(json_text)
                    print("   ✅ Successfully enhanced with Gemini")
                    return enhanced_analysis
                
        print(f"   ⚠️ Gemini enhancement failed, using Vision-only analysis")
        return vision_analysis
        
    except Exception as e:
        print(f"   ⚠️ Gemini unavailable ({str(e)[:50]}...), using Vision-only analysis")
        return vision_analysis


def display_hybrid_results(analysis, is_enhanced=False):
    """Display the hybrid Vision + optional Gemini results."""
    enhancement_status = "GEMINI ENHANCED" if is_enhanced else "VISION POWERED"
    
    print(f"\n" + "=" * 80)
    print(f"🎯 HYBRID BUSINESS ANALYSIS ({enhancement_status})")
    print("=" * 80)
    
    if not analysis:
        print("❌ No analysis results to display")
        return
    
    # Business Canvas
    if 'businessCanvas' in analysis:
        canvas = analysis['businessCanvas']
        print(f"\n💼 BUSINESS MODEL CANVAS (9 BLOCKS):")
        print("═" * 60)
        
        bmc_sections = [
            ('keyPartners', '🤝 KEY PARTNERS'),
            ('keyActivities', '⚙️ KEY ACTIVITIES'),
            ('keyResources', '🔧 KEY RESOURCES'),
            ('valueProposition', '⭐ VALUE PROPOSITION'),
            ('customerRelationships', '👥 CUSTOMER RELATIONSHIPS'),
            ('channels', '📡 CHANNELS'),
            ('customerSegments', '🎯 CUSTOMER SEGMENTS'),
            ('costStructure', '💸 COST STRUCTURE'),
            ('revenueStreams', '💰 REVENUE STREAMS')
        ]
        
        for key, title in bmc_sections:
            if key in canvas:
                section = canvas[key]
                print(f"\n{title}:")
                if isinstance(section, dict):
                    print(f"   {section.get('description', 'Not specified')}")
                    details = section.get('details', 'Not specified')
                    if details and details != 'Not specified':
                        print(f"   Details: {details[:150]}...")
                else:
                    print(f"   {section}")
    
    # SWOT Analysis
    if 'businessAnalysis' in analysis:
        swot = analysis['businessAnalysis']
        print(f"\n📊 SWOT ANALYSIS:")
        print("─" * 40)
        
        if swot.get('strengths'):
            print(f"💪 STRENGTHS:")
            for i, strength in enumerate(swot['strengths'], 1):
                print(f"   {i}. {strength}")
        
        if swot.get('weaknesses'):
            print(f"\n⚠️ WEAKNESSES:")
            for i, weakness in enumerate(swot['weaknesses'], 1):
                print(f"   {i}. {weakness}")
        
        if swot.get('opportunities'):
            print(f"\n🚀 OPPORTUNITIES:")
            for i, opportunity in enumerate(swot['opportunities'], 1):
                print(f"   {i}. {opportunity}")
        
        if swot.get('threats'):
            print(f"\n⚡ THREATS:")
            for i, threat in enumerate(swot['threats'], 1):
                print(f"   {i}. {threat}")
    
    # Viability Score
    score = analysis.get('trafficLightScore', 'Not specified')
    score_emoji = {"GREEN": "🟢", "YELLOW": "🟡", "RED": "🔴"}.get(score.upper(), "⚪")
    print(f"\n{score_emoji} VIABILITY ASSESSMENT: {score}")
    
    # Recommendations
    if analysis.get('feedbackSuggestions'):
        print(f"\n💡 RECOMMENDATIONS:")
        for i, suggestion in enumerate(analysis['feedbackSuggestions'], 1):
            print(f"   {i}. {suggestion}")
    
    # Local Impact
    local_impact = analysis.get('localImpactMapping', 'Not specified')
    print(f"\n🌍 LOCAL IMPACT:")
    print(f"   {local_impact}")


def save_hybrid_results(vision_text, analysis, is_enhanced=False):
    """Save hybrid analysis results."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    enhancement_suffix = "_gemini_enhanced" if is_enhanced else "_vision_powered"
    saved_files = []
    
    # Save OCR text
    ocr_file = os.path.join(OUTPUT_FOLDER, f"vision_ocr{enhancement_suffix}_{timestamp}.txt")
    with open(ocr_file, 'w', encoding='utf-8') as f:
        f.write("GOOGLE VISION API OCR RESULTS\n")
        f.write("=" * 50 + "\n\n")
        f.write(vision_text)
    saved_files.append(ocr_file)
    
    # Save analysis
    if analysis:
        analysis_file = os.path.join(OUTPUT_FOLDER, f"business_analysis{enhancement_suffix}_{timestamp}.json")
        with open(analysis_file, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)
        saved_files.append(analysis_file)
    
    return saved_files


def main():
    """Main function for hybrid Vision + optional Gemini analysis."""
    print("🚀 HYBRID VISION + GEMINI BUSINESS ANALYZER")
    print("=" * 60)
    print("📊 Primary: Google Vision API (Always Available)")
    print("🤖 Enhancement: Gemini AI (When Available)")
    print("🎯 Project: northern-window-473416-i0")
    print("=" * 60)
    
    try:
        pdf_files = [f for f in os.listdir(INPUT_FOLDER) if f.lower().endswith(".pdf")]
        
        if not pdf_files:
            print("❌ No PDF files found in 'pdf' folder")
            return
        
        for pdf_file in pdf_files:
            pdf_path = os.path.join(INPUT_FOLDER, pdf_file)
            
            print(f"\n📋 Processing: {pdf_file}")
            
            # Step 1: Extract text with Google Vision API
            print("🔍 Extracting text with Google Vision API...")
            images = pdf_to_images_pymupdf(pdf_path)
            print(f"   📄 Converted to {len(images)} images")
            
            all_text_pages = []
            total_annotations = 0
            
            for i, img in enumerate(images, 1):
                print(f"   🔄 Processing page {i}/{len(images)} with Vision API...")
                page_text, annotations = extract_text_with_vision_api(img)
                
                if page_text:
                    all_text_pages.append({
                        'page': i,
                        'text': page_text.strip(),
                        'annotations': annotations
                    })
                    total_annotations += len(annotations)
                    print(f"      ✅ Extracted {len(annotations)} text elements")
                else:
                    print(f"      ⚠️ No text found on page {i}")
            
            combined_text = "\n\n".join([page['text'] for page in all_text_pages if page['text']])
            
            print(f"   📊 Total text extracted: {len(combined_text):,} characters")
            print(f"   📊 Total annotations: {total_annotations}")
            
            if not combined_text.strip():
                print("❌ No text extracted from PDF")
                continue
            
            # Step 2: Analyze with Vision-based parsing
            print("🔬 Analyzing business plan with Vision API data...")
            vision_analysis = analyze_business_plan_with_vision(combined_text)
            
            # Step 3: Try to enhance with Gemini (fallback to Vision-only)
            final_analysis = enhance_with_gemini(vision_analysis, combined_text)
            is_enhanced = final_analysis != vision_analysis
            
            # Step 4: Save results
            print("💾 Saving hybrid results...")
            saved_files = save_hybrid_results(combined_text, final_analysis, is_enhanced)
            
            # Step 5: Display results
            display_hybrid_results(final_analysis, is_enhanced)
            
            # Step 6: Show saved files
            print(f"\n📁 FILES CREATED:")
            for file_path in saved_files:
                file_size = os.path.getsize(file_path)
                print(f"   • {os.path.basename(file_path)} ({file_size:,} bytes)")
            
            print(f"\n✅ HYBRID ANALYSIS COMPLETE!")
            print(f"   📂 Results saved in: {OUTPUT_FOLDER}")
            
            if is_enhanced:
                print("   🌟 Analysis enhanced with Gemini AI")
            else:
                print("   🔧 Analysis powered by Google Vision API only")
    
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()