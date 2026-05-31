import google.generativeai as genai
import os
import json
import random
from django.conf import settings
from PIL import Image

def get_gemini_api_key():
    keys = [
        os.getenv('GEMINI_API_KEY_1'),
        os.getenv('GEMINI_API_KEY_2')
    ]
    valid_keys = [key for key in keys if key]

    if not valid_keys:
        raise ValueError("Brak jakiegokolwiek klucza GEMINI_API_KEY w zmiennych środowiskowych!")

    selected_key = random.choice(valid_keys)
    return selected_key

def analyze_cloth_image(image_path):
    api_key = get_gemini_api_key()
    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel('gemini-3-flash-preview')

    prompt = """
    Przeanalizuj zdjęcie tego ubrania i zwróć odpowiedź.
    Wymagane pola w obiekcie:
    - "color": (główny kolor ubrania, np. "Czarny", "Niebieski", "Turkusowy")
    - "category": (tablica/lista stringów. Musi zawierać TYP ubrania np. "T-shirt", "Koszula", "Spodnie", "Buty", "Akcesoria" ORAZ PASUJĄCE OKAZJE/STYL (DOKŁADNIE TYLKO TE): "Casual/Na co dzień", "Streetwear", "Eleganckie", "Sportowe")
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
    api_key = get_gemini_api_key()
    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel('gemini-3-flash-preview')
    
    prompt = f"""
    Jesteś profesjonalnym stylistą. Na podstawie listy ubrań, 
    wybierz zestaw na okazję: {occasion}. 
    Zwróć odpowiedź WYŁĄCZNIE jako obiekt JSON posiadający jeden klucz "outfit_ids", 
    który będzie zawierał tablicę (listę) numerów ID wybranych ubrań.
    Przykład poprawnej odpowiedzi: {{"outfit_ids": [1, 4, 7]}}

    STYLIZACJA MUSI BYĆ SPÓJNA I PASOWAĆ DO OKAZJI!! MUSI ZAWIERAĆ ODZIEŻ, OBUWIE I DODATKI (JEŚLI SĄ DOSTĘPNE).

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