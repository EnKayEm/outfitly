import google.generativeai as genai
import os
import json
from django.conf import settings

def generate_stylization(wardrobe_data, occasion):
    # Konfiguracja klucza z pliku .env
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    model = genai.GenerativeModel('gemini-3-flash-preview')
    
    prompt = f"""
    Jesteś profesjonalnym stylistą. Na podstawie listy ubrań w formacie JSON, 
    wybierz zestaw na okazję: {occasion}. 
    Zwróć odpowiedź WYŁĄCZNIE jako JSON z tablicą ID wybranych elementów.
    
    Lista ubrań:
    {json.dumps(wardrobe_data)}
    """
    
    response = model.generate_content(prompt)
    
    return json.loads(response.text)