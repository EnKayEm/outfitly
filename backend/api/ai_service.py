import google.generativeai as genai
import os
import json
from django.conf import settings
from PIL import Image

def analyze_cloth_image(image_path):
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("Brak GEMINI_API_KEY w zmiennych środowiskowych!")

    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel('gemini-3-flash-preview')

    prompt = """
    Przeanalizuj zdjęcie tego ubrania i zwróć odpowiedź.
    Wymagane pola w obiekcie:
    - "color": (główny kolor ubrania, np. "Czarny", "Niebieski")
    - "category": (tablica/lista stringów. Musi zawierać TYP ubrania np. "T-shirt", "Koszula", "Spodnie" ORAZ PASUJĄCE OKAZJE/STYL np. "Na co dzień", "Praca", "Eleganckie", "Sport", "Zima")
    - "description": (krótki, zwięzły opis ubrania, max 100 znaków)
    BARDZO WAŻNE: Jeśli na przesłanym zdjęciu nie znajduje się element garderoby (ubranie, buty, dodatki), zwróć TYLKO json: {'error': 'not_clothing'}. Nie opisuj tego zdjęcia.
    """

    try:
        img = Image.open(image_path)
        
        response = model.generate_content(
            [prompt, img],
            generation_config={"response_mime_type": "application/json"}
        )
            
        return json.loads(response.text)
        
    except Exception as e:
        print(f"Błąd podczas analizy obrazu przez AI: {e}")
        return None

def generate_stylization(wardrobe_data, occasion):
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("Brak GEMINI_API_KEY w zmiennych środowiskowych!")

    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel('gemini-3-flash-preview')
    
    prompt = f"""
    Jesteś profesjonalnym stylistą. Na podstawie listy ubrań, 
    wybierz zestaw na okazję: {occasion}. 
    Zwróć odpowiedź WYŁĄCZNIE jako obiekt JSON posiadający jeden klucz "outfit_ids", 
    który będzie zawierał tablicę (listę) numerów ID wybranych ubrań.
    Przykład poprawnej odpowiedzi: {{"outfit_ids": [1, 4, 7]}}
    
    Lista ubrań:
    {json.dumps(wardrobe_data, ensure_ascii=False)}
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        return json.loads(response.text)
    
    except Exception as e:
        print(f"Błąd podczas generowania stylizacji: {e}")
        return None