from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import io
import json
import requests
import fitz  # PyMuPDF
from PIL import Image, ImageEnhance, ImageFilter
from google.cloud import vision
from google.oauth2 import service_account
from datetime import datetime
import re
import os
import tempfile
import traceback
from typing import Dict, Any

app = FastAPI(title="Incentra Business Analysis API", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev server (both ports)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
VISION_CREDENTIALS_FILE = "northern-window-vision.json"
GEMINI_API_KEY = "AIzaSyBexWIe3_Stau2pzckyhQWfsxFTSRfBTS4"
GEMINI_TEXT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

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
    """Enhanced business plan analysis with comprehensive fallback data."""
    
    # Clean and normalize text
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = text.strip()
    
    print(f"📝 Analyzing extracted text ({len(text)} characters)...")
    
    # Initialize analysis structure with rich default content
    analysis = {
        "businessCanvas": {
            "keyPartners": {
                "description": "Strategic partnerships and key suppliers",
                "details": ""
            },
            "keyActivities": {
                "description": "Core business operations and value-creating activities",
                "details": ""
            },
            "keyResources": {
                "description": "Essential assets required for business success",
                "details": ""
            },
            "valueProposition": {
                "description": "Unique value delivered to customers",
                "details": ""
            },
            "customerRelationships": {
                "description": "How the business interacts with customer segments",
                "details": ""
            },
            "channels": {
                "description": "Distribution and sales channels to reach customers",
                "details": ""
            },
            "customerSegments": {
                "description": "Target customer groups and market segments",
                "details": ""
            },
            "costStructure": {
                "description": "Major cost components and expense structure",
                "details": ""
            },
            "revenueStreams": {
                "description": "Revenue generation methods and pricing models",
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
    
    # Enhanced text analysis with multiple patterns
    text_lower = text.lower()
    words = text_lower.split()
    
    # Extract business information with broader patterns
    business_name = extract_pattern(text, r'(?:business|company|enterprise|venture|startup|firm)\s*(?:name|title)?[:\s]*([A-Za-z\s&]+)', "Innovative Business Venture")
    if not business_name or business_name == "Innovative Business Venture":
        # Try to find any capitalized words that might be business names
        business_match = re.search(r'([A-Z][a-z]+ [A-Z][a-z]+)|([A-Z]{2,})', text)
        business_name = business_match.group(0) if business_match else "Innovative Business Venture"
    
    # Detect business type/industry
    industry_keywords = {
        'technology': ['app', 'software', 'digital', 'online', 'platform', 'tech', 'AI', 'system'],
        'food': ['restaurant', 'food', 'catering', 'kitchen', 'cook', 'meal', 'dining'],
        'retail': ['store', 'shop', 'retail', 'sales', 'products', 'merchandise'],
        'service': ['service', 'consulting', 'support', 'help', 'assistance'],
        'manufacturing': ['production', 'factory', 'manufacturing', 'products', 'goods'],
        'agriculture': ['farm', 'organic', 'crops', 'agricultural', 'farming'],
        'healthcare': ['health', 'medical', 'clinic', 'treatment', 'care'],
        'education': ['education', 'training', 'learning', 'school', 'course']
    }
    
    detected_industry = 'general business'
    for industry, keywords in industry_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            detected_industry = industry
            break
    
    # Enhanced business canvas population
    if detected_industry == 'technology':
        analysis["businessCanvas"]["keyPartners"]["details"] = "Technology vendors, cloud service providers, software development partners, integration specialists"
        analysis["businessCanvas"]["keyActivities"]["details"] = "Software development, user experience design, data analytics, customer support, platform maintenance"
        analysis["businessCanvas"]["keyResources"]["details"] = "Development team, technology infrastructure, intellectual property, user data, brand reputation"
        analysis["businessCanvas"]["valueProposition"]["details"] = f"{business_name} provides innovative technology solutions that streamline processes and enhance user experience"
        analysis["businessCanvas"]["channels"]["details"] = "Online platform, mobile app, digital marketing, partner networks, direct sales"
        analysis["businessCanvas"]["customerSegments"]["details"] = "Tech-savvy consumers, businesses seeking digital transformation, early adopters"
        
    elif detected_industry == 'food':
        analysis["businessCanvas"]["keyPartners"]["details"] = "Local suppliers, food distributors, delivery services, equipment providers, regulatory bodies"
        analysis["businessCanvas"]["keyActivities"]["details"] = "Food preparation, quality control, customer service, inventory management, marketing"
        analysis["businessCanvas"]["keyResources"]["details"] = "Kitchen facilities, skilled staff, supply chain relationships, brand reputation, location"
        analysis["businessCanvas"]["valueProposition"]["details"] = f"{business_name} offers high-quality food experiences with fresh ingredients and excellent customer service"
        analysis["businessCanvas"]["channels"]["details"] = "Physical location, delivery apps, online ordering, social media, word-of-mouth"
        analysis["businessCanvas"]["customerSegments"]["details"] = "Local community, food enthusiasts, busy professionals, families"
        
    elif detected_industry == 'agriculture':
        analysis["businessCanvas"]["keyPartners"]["details"] = "Local farmers, organic certification bodies, distribution networks, equipment suppliers"
        analysis["businessCanvas"]["keyActivities"]["details"] = "Crop production, quality assurance, harvesting, packaging, distribution, customer education"
        analysis["businessCanvas"]["keyResources"]["details"] = "Agricultural land, farming equipment, skilled labor, certification credentials, distribution network"
        analysis["businessCanvas"]["valueProposition"]["details"] = f"{business_name} provides sustainable, high-quality agricultural products with environmental responsibility"
        analysis["businessCanvas"]["channels"]["details"] = "Farmers markets, organic stores, direct-to-consumer sales, wholesale distribution"
        analysis["businessCanvas"]["customerSegments"]["details"] = "Health-conscious consumers, organic food retailers, restaurants, local communities"
        
    else:
        # General business template
        analysis["businessCanvas"]["keyPartners"]["details"] = f"Strategic suppliers, distribution partners, technology providers, industry associations supporting {business_name}"
        analysis["businessCanvas"]["keyActivities"]["details"] = f"Core operations of {business_name} including production, marketing, customer service, and quality management"
        analysis["businessCanvas"]["keyResources"]["details"] = f"Essential assets for {business_name}: skilled workforce, operational facilities, brand reputation, customer relationships"
        analysis["businessCanvas"]["valueProposition"]["details"] = f"{business_name} delivers unique value through quality products/services, competitive pricing, and excellent customer experience"
        analysis["businessCanvas"]["channels"]["details"] = f"Multi-channel approach including direct sales, online presence, partnerships, and traditional marketing for {business_name}"
        analysis["businessCanvas"]["customerSegments"]["details"] = f"Target customers for {business_name} including primary market segments and niche customer groups"
    
    # Enhanced SWOT Analysis based on content and industry
    strengths = []
    weaknesses = []
    opportunities = []
    threats = []
    
    # Analyze text content for business characteristics
    if any(word in text_lower for word in ['innovative', 'new', 'unique', 'first', 'novel']):
        strengths.append("Innovation and unique market positioning")
        opportunities.append("First-mover advantage in emerging market segment")
    
    if any(word in text_lower for word in ['experienced', 'skilled', 'expert', 'professional']):
        strengths.append("Experienced team with industry expertise")
    else:
        weaknesses.append("Need to build team expertise and experience")
    
    if any(word in text_lower for word in ['local', 'community', 'regional']):
        strengths.append("Strong local market knowledge and community connections")
        opportunities.append("Expansion potential to neighboring markets")
    
    if any(word in text_lower for word in ['online', 'digital', 'internet', 'technology']):
        strengths.append("Digital presence and technology adoption")
        opportunities.append("Scalability through digital channels")
    else:
        opportunities.append("Digital transformation and online presence development")
    
    if any(word in text_lower for word in ['competition', 'competitor', 'rivals']):
        threats.append("Competitive market with established players")
    
    if any(word in text_lower for word in ['small', 'startup', 'new']):
        weaknesses.append("Limited resources and brand recognition as emerging business")
        opportunities.append("Agility and ability to adapt quickly to market changes")
    
    # Add industry-specific SWOT elements
    if detected_industry == 'technology':
        strengths.append("Scalable technology platform")
        opportunities.append("Growing demand for digital solutions")
        threats.append("Rapid technological changes and competition")
        
    elif detected_industry == 'food':
        strengths.append("Personal customer relationships and quality focus")
        opportunities.append("Growing food delivery and convenience market")
        threats.append("Food safety regulations and supply chain risks")
        
    elif detected_industry == 'agriculture':
        strengths.append("Sustainable practices appeal to eco-conscious consumers")
        opportunities.append("Increasing demand for organic and local products")
        threats.append("Weather dependency and seasonal variations")
    
    # Ensure minimum content
    if not strengths:
        strengths = ["Dedicated team with clear vision", "Identified market need", "Flexible business model"]
    if not weaknesses:
        weaknesses = ["Limited initial capital", "Building brand awareness needed", "Establishing customer base"]
    if not opportunities:
        opportunities = ["Market growth potential", "Partnership development", "Product/service expansion"]
    if not threats:
        threats = ["Economic uncertainty", "New market entrants", "Changing customer preferences"]
    
    analysis["businessAnalysis"]["strengths"] = strengths
    analysis["businessAnalysis"]["weaknesses"] = weaknesses
    analysis["businessAnalysis"]["opportunities"] = opportunities
    analysis["businessAnalysis"]["threats"] = threats
    
    # Enhanced cost and revenue analysis
    analysis["businessCanvas"]["costStructure"]["details"] = f"Key costs for {business_name}: personnel expenses, operational overhead, marketing investment, technology infrastructure, regulatory compliance"
    analysis["businessCanvas"]["revenueStreams"]["details"] = f"Revenue sources: primary product/service sales, subscription models, partnerships, premium services, ancillary revenue streams"
    analysis["businessCanvas"]["customerRelationships"]["details"] = f"Customer engagement through personalized service, community building, feedback systems, loyalty programs, and ongoing support"
    
    # Enhanced recommendations based on industry and analysis
    recommendations = []
    
    if detected_industry == 'technology':
        recommendations = [
            "Develop a robust MVP and iterative development process",
            "Build strategic partnerships with complementary technology providers",
            "Focus on user acquisition and retention metrics",
            "Establish scalable infrastructure for growth"
        ]
    elif detected_industry == 'food':
        recommendations = [
            "Ensure compliance with food safety and health regulations",
            "Develop strong supplier relationships for consistent quality",
            "Create memorable customer experiences to build loyalty",
            "Consider delivery and online ordering capabilities"
        ]
    elif detected_industry == 'agriculture':
        recommendations = [
            "Obtain necessary organic certifications and quality standards",
            "Build direct relationships with end consumers",
            "Develop weather risk management and insurance strategies",
            "Create value-added products to increase margins"
        ]
    else:
        recommendations = [
            "Conduct thorough market research and competitive analysis",
            "Develop a strong brand identity and value proposition",
            "Create detailed financial projections and funding strategy",
            "Build a skilled team with complementary expertise",
            "Establish key performance indicators and measurement systems"
        ]
    
    analysis["feedbackSuggestions"] = recommendations
    
    # Enhanced local impact assessment
    if 'local' in text_lower or 'community' in text_lower:
        analysis["localImpactMapping"] = f"{business_name} demonstrates strong commitment to local economic development through job creation, community engagement, and supporting local supply chains. Expected to generate significant positive impact on regional economy."
    else:
        analysis["localImpactMapping"] = f"{business_name} has potential for positive regional economic impact through employment opportunities, tax revenue generation, and stimulating related business activities in the local ecosystem."
    
    # Add AI scoring first
    analysis["aiScoring"] = calculate_ai_scoring(analysis, text)
    
    # Determine traffic light score based on AI scoring
    ai_score = analysis["aiScoring"]["overallScore"]
    if ai_score >= 75:
        analysis["trafficLightScore"] = "GREEN"
    elif ai_score >= 35:
        analysis["trafficLightScore"] = "YELLOW"
    else:
        analysis["trafficLightScore"] = "RED"
    
    return analysis

def extract_pattern(text, pattern, default=""):
    """Extract information using regex pattern."""
    import re
    match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
    return match.group(1).strip() if match else default

def calculate_ai_scoring(analysis, original_text):
    """Calculate AI scoring based on predefined rubrics."""
    scoring = {
        "overallScore": 0,
        "rubrics": {
            "completeness": {"score": 0, "maxScore": 25, "feedback": ""},
            "clarity": {"score": 0, "maxScore": 25, "feedback": ""},
            "feasibility": {"score": 0, "maxScore": 25, "feedback": ""},
            "innovation": {"score": 0, "maxScore": 25, "feedback": ""}
        },
        "strengths": [],
        "weaknesses": [],
        "improvements": [],
        "detailedFeedback": ""
    }
    
    text_lower = original_text.lower()
    business_canvas = analysis.get("businessCanvas", {})
    business_analysis = analysis.get("businessAnalysis", {})
    
    # COMPLETENESS SCORING (25 points)
    completeness_score = 0
    completeness_feedback = []
    
    # Check if all BMC components are present
    bmc_components = ["customerSegments", "valuePropositions", "channels", "customerRelationships", 
                     "revenueStreams", "keyResources", "keyActivities", "keyPartnerships", "costStructure"]
    present_components = sum(1 for comp in bmc_components if business_canvas.get(comp, {}).get("items"))
    completeness_score += min(15, (present_components / len(bmc_components)) * 15)
    
    if present_components >= 7:
        completeness_feedback.append("Comprehensive business model coverage")
    elif present_components >= 5:
        completeness_feedback.append("Good coverage of key business components")
    else:
        completeness_feedback.append("Several business model components need development")
    
    # Check for financial information
    if any(term in text_lower for term in ['revenue', 'cost', 'profit', 'financial', 'budget', 'investment']):
        completeness_score += 5
        completeness_feedback.append("Financial considerations included")
    else:
        completeness_feedback.append("Financial planning needs more detail")
    
    # Check for market analysis
    if any(term in text_lower for term in ['market', 'customer', 'competition', 'target', 'segment']):
        completeness_score += 5
        completeness_feedback.append("Market analysis present")
    else:
        completeness_feedback.append("Market analysis requires expansion")
    
    scoring["rubrics"]["completeness"]["score"] = min(25, completeness_score)
    scoring["rubrics"]["completeness"]["feedback"] = "; ".join(completeness_feedback)
    
    # CLARITY SCORING (25 points)
    clarity_score = 0
    clarity_feedback = []
    
    # Text length and detail check
    if len(original_text) > 500:
        clarity_score += 8
        clarity_feedback.append("Detailed description provided")
    elif len(original_text) > 200:
        clarity_score += 5
        clarity_feedback.append("Adequate detail level")
    else:
        clarity_feedback.append("More detailed description needed")
    
    # Value proposition clarity
    value_prop = business_canvas.get("valuePropositions", {}).get("items", [])
    if len(value_prop) >= 2:
        clarity_score += 8
        clarity_feedback.append("Clear value propositions")
    elif len(value_prop) >= 1:
        clarity_score += 5
        clarity_feedback.append("Basic value proposition identified")
    else:
        clarity_feedback.append("Value proposition needs clarification")
    
    # Customer segment clarity
    customer_segments = business_canvas.get("customerSegments", {}).get("items", [])
    if len(customer_segments) >= 2:
        clarity_score += 9
        clarity_feedback.append("Well-defined customer segments")
    elif len(customer_segments) >= 1:
        clarity_score += 6
        clarity_feedback.append("Customer segment identified")
    else:
        clarity_feedback.append("Customer segments need definition")
    
    scoring["rubrics"]["clarity"]["score"] = min(25, clarity_score)
    scoring["rubrics"]["clarity"]["feedback"] = "; ".join(clarity_feedback)
    
    # FEASIBILITY SCORING (25 points)
    feasibility_score = 0
    feasibility_feedback = []
    
    # Resource requirements
    key_resources = business_canvas.get("keyResources", {}).get("items", [])
    if len(key_resources) >= 3:
        feasibility_score += 8
        feasibility_feedback.append("Key resources well identified")
    elif len(key_resources) >= 1:
        feasibility_score += 5
        feasibility_feedback.append("Basic resources identified")
    else:
        feasibility_feedback.append("Resource planning needs attention")
    
    # Revenue model
    revenue_streams = business_canvas.get("revenueStreams", {}).get("items", [])
    if len(revenue_streams) >= 2:
        feasibility_score += 8
        feasibility_feedback.append("Multiple revenue streams identified")
    elif len(revenue_streams) >= 1:
        feasibility_score += 5
        feasibility_feedback.append("Revenue model present")
    else:
        feasibility_feedback.append("Revenue model needs development")
    
    # Cost structure awareness
    cost_structure = business_canvas.get("costStructure", {}).get("items", [])
    if len(cost_structure) >= 3:
        feasibility_score += 9
        feasibility_feedback.append("Comprehensive cost analysis")
    elif len(cost_structure) >= 1:
        feasibility_score += 6
        feasibility_feedback.append("Basic cost awareness")
    else:
        feasibility_feedback.append("Cost structure needs analysis")
    
    scoring["rubrics"]["feasibility"]["score"] = min(25, feasibility_score)
    scoring["rubrics"]["feasibility"]["feedback"] = "; ".join(feasibility_feedback)
    
    # INNOVATION SCORING (25 points)
    innovation_score = 0
    innovation_feedback = []
    
    # Technology/digital presence
    if any(term in text_lower for term in ['digital', 'technology', 'online', 'app', 'platform', 'ai', 'automation']):
        innovation_score += 8
        innovation_feedback.append("Technology integration identified")
    
    # Sustainability/social impact
    if any(term in text_lower for term in ['sustainable', 'environmental', 'social', 'impact', 'green', 'eco']):
        innovation_score += 8
        innovation_feedback.append("Sustainability considerations present")
    
    # Unique value proposition
    if any(term in text_lower for term in ['unique', 'innovative', 'first', 'new', 'different', 'breakthrough']):
        innovation_score += 9
        innovation_feedback.append("Innovative elements identified")
    elif len(value_prop) > 0:
        innovation_score += 5
        innovation_feedback.append("Value differentiation present")
    
    if not innovation_feedback:
        innovation_feedback.append("More innovative elements could strengthen the business")
    
    scoring["rubrics"]["innovation"]["score"] = min(25, innovation_score)
    scoring["rubrics"]["innovation"]["feedback"] = "; ".join(innovation_feedback)
    
    # CALCULATE OVERALL SCORE
    total_score = sum(rubric["score"] for rubric in scoring["rubrics"].values())
    scoring["overallScore"] = total_score
    
    # SCORE INTERPRETATION AND COLOR CODING
    if total_score >= 75:
        scoring["scoreColor"] = "green"
        scoring["scoreLevel"] = "Excellent"
        scoring["strengths"] = ["Comprehensive business planning", "Clear value proposition", "Well-structured approach"]
        scoring["detailedFeedback"] = "Excellent business plan with strong foundation across all areas. Ready for implementation."
    elif total_score >= 35:
        scoring["scoreColor"] = "yellow"
        scoring["scoreLevel"] = "Good"
        scoring["strengths"] = ["Good foundation", "Clear direction", "Solid core concept"]
        scoring["detailedFeedback"] = "Good business plan with room for enhancement in specific areas. Continue developing key components."
    else:
        scoring["scoreColor"] = "red"
        scoring["scoreLevel"] = "Needs Development"
        scoring["strengths"] = ["Initial concept present", "Foundation to build upon"]
        scoring["detailedFeedback"] = "Business plan requires substantial development across multiple areas. Focus on core business model components."
    
    # Add specific weaknesses based on low scores
    for rubric_name, rubric_data in scoring["rubrics"].items():
        if rubric_data["score"] < 15:
            if rubric_name == "completeness":
                scoring["weaknesses"].append("Incomplete business model components")
                scoring["improvements"].append("Develop all 9 Business Model Canvas components thoroughly")
            elif rubric_name == "clarity":
                scoring["weaknesses"].append("Lacks clarity in key areas")
                scoring["improvements"].append("Provide more detailed descriptions of value propositions and customer segments")
            elif rubric_name == "feasibility":
                scoring["weaknesses"].append("Feasibility concerns")
                scoring["improvements"].append("Strengthen resource planning and revenue model validation")
            elif rubric_name == "innovation":
                scoring["weaknesses"].append("Limited innovation elements")
                scoring["improvements"].append("Incorporate more innovative or differentiating factors")
    
    # Add general improvements
    if total_score < 70:
        scoring["improvements"].extend([
            "Conduct thorough market research and competitor analysis",
            "Develop detailed financial projections and funding requirements",
            "Create a comprehensive go-to-market strategy"
        ])
    
    return scoring

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
            timeout=30
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
                    
                    # Recalculate AI scoring with enhanced content
                    enhanced_analysis["aiScoring"] = calculate_ai_scoring(enhanced_analysis, original_text)
                    
                    print("   ✅ Successfully enhanced with Gemini")
                    return enhanced_analysis
                
        print(f"   ⚠️ Gemini enhancement failed, using Vision-only analysis")
        return vision_analysis
        
    except Exception as e:
        print(f"   ⚠️ Gemini unavailable ({str(e)[:50]}...), using Vision-only analysis")
        return vision_analysis

@app.get("/")
async def root():
    return {"message": "Incentra Business Analysis API", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/api/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    """
    Analyze a PDF business plan using Vision API and Gemini
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read the uploaded file
        contents = await file.read()
        
        # Create a temporary file to save the PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name
        
        try:
            print(f"📋 Processing: {file.filename}")
            
            # Step 1: Extract text with Google Vision API
            print("🔍 Extracting text with Google Vision API...")
            images = pdf_to_images_pymupdf(temp_file_path)
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
                raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")
            
            # Step 2: Analyze with Vision-based parsing
            print("🔬 Analyzing business plan with Vision API data...")
            vision_analysis = analyze_business_plan_with_vision(combined_text)
            
            # Step 3: Try to enhance with Gemini (fallback to Vision-only)
            final_analysis = enhance_with_gemini(vision_analysis, combined_text)
            is_enhanced = final_analysis != vision_analysis
            
            print(f"✅ Analysis complete!")
            if is_enhanced:
                print("   🌟 Analysis enhanced with Gemini AI")
            else:
                print("   🔧 Analysis powered by Google Vision API only")
            
            # Return the analysis results
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "filename": file.filename,
                    "analysis": final_analysis,
                    "metadata": {
                        "pages_processed": len(images),
                        "text_length": len(combined_text),
                        "annotations_count": total_annotations,
                        "enhanced_with_gemini": is_enhanced,
                        "processed_at": datetime.now().isoformat()
                    },
                    "extracted_text": combined_text[:1000] + "..." if len(combined_text) > 1000 else combined_text
                }
            )
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error processing PDF: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing PDF: {str(e)}"
        )

@app.post("/api/analyze-text")
async def analyze_text(request: Dict[str, Any]):
    """
    Analyze business idea text directly (without PDF upload)
    """
    try:
        text_input = request.get("text", "")
        if not text_input.strip():
            raise HTTPException(status_code=400, detail="Text input is required")
        
        print("🔬 Analyzing business idea text...")
        
        # Step 1: Analyze with rule-based parsing
        vision_analysis = analyze_business_plan_with_vision(text_input)
        
        # Step 2: Try to enhance with Gemini
        final_analysis = enhance_with_gemini(vision_analysis, text_input)
        is_enhanced = final_analysis != vision_analysis
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "analysis": final_analysis,
                "metadata": {
                    "text_length": len(text_input),
                    "enhanced_with_gemini": is_enhanced,
                    "processed_at": datetime.now().isoformat()
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error analyzing text: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing text: {str(e)}"
        )

if __name__ == "__main__":
    # Check if credentials exist
    if not os.path.exists(VISION_CREDENTIALS_FILE):
        print(f"❌ ERROR: {VISION_CREDENTIALS_FILE} not found!")
        print("Please ensure the Google Cloud credentials file is available.")
        exit(1)
    
    print("🚀 Starting Incentra Business Analysis API Server...")
    print("📊 Vision API: Google Cloud Vision")
    print("🤖 Enhancement: Gemini AI")
    print("🌐 CORS enabled for: http://localhost:3000")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8001)