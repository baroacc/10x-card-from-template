# Plan implementacji usługi OpenRouter

Niniejszy dokument przedstawia kompleksowy plan wdrożenia usługi OpenRouter, która będzie integrować się z API OpenRouter w celu uzupełnienia funkcjonalności czatów opartych na LLM.

---

## 1. Opis usługi

Usługa OpenRouter została zaprojektowana, aby integrować się z zewnętrznym API OpenRouter i wspierać funkcjonalność czatu poprzez:
- Budowanie ustrukturyzowanych zapytań z komunikatami systemowymi i użytkownika.
- Uwzględnianie konfiguracji modelu, takich jak nazwa modelu i jego parametry.
- Obsługę ustrukturyzowanych odpowiedzi przy użyciu zdefiniowanego schematu JSON.
- Zarządzanie błędami oraz zapewnienie bezpiecznej komunikacji z API.

---

## 2. Opis konstruktora

Konstruktor usługi jest odpowiedzialny za inicjalizację usługi z wszystkimi wymaganymi parametrami konfiguracji. Konstruktor będzie:
- Przyjmował klucze API, adresy URL punktów końcowych oraz dane uwierzytelniające (zarządzane bezpiecznie poprzez zmienne środowiskowe lub system zarządzania sekretami).
- Konfigurował domyślne wartości dla komunikatu systemowego, nazwy modelu, parametrów modelu oraz formatu odpowiedzi.
- Inicjalizował wewnętrzne właściwości do budowania zapytań, parsowania odpowiedzi i obsługi błędów.

---

## 3. Publiczne metody i pola

### Metody publiczne

1. **initialize(config: ServiceConfig): void**  
   Inicjalizuje usługę niezbędną konfiguracją, taką jak klucz API, punkt końcowy oraz domyślne komunikaty.

2. **setSystemMessage(message: string): void**  
   Umożliwia dostosowanie komunikatu systemowego używanego w zapytaniach do API.

3. **setUserMessage(message: string): void**  
   Umożliwia ustawienie ostatniego komunikatu użytkownika przekazywanego w zapytaniu do API.

4. **setModelConfig(config: ModelConfig): void**  
   Aktualizuje nazwę modelu i jego parametry (np. temperature, max tokens).

5. **sendRequest(): Promise<ResponseData>**  
   Buduje wywołanie API wykorzystując obecną konfigurację, wysyła zapytanie i zwraca sparsowaną odpowiedź.

6. **parseResponse(rawResponse: any): ResponseData**  
   Waliduje i konwertuje surową odpowiedź API na ustrukturyzowany obiekt danych, zgodnie z zdefiniowanym schematem JSON.

### Pola publiczne

- **apiEndpoint: string**  
  Adres URL punktu końcowego API OpenRouter.

- **defaultResponseFormat: ResponseFormat**  
  Zawiera schemat JSON (przykład poniżej) dla ustrukturyzowanych odpowiedzi:
  ```json
  {
    "type": "json_schema",
    "json_schema": {
      "name": "completionSchema",
      "strict": true,
      "schema": {
        "response": "string"
      }
    }
  }
  ```

---

## 4. Prywatne metody i pola

### Metody prywatne

1. **buildRequestPayload(): RequestPayload**  
   Gromadzi komunikat systemowy, komunikat użytkownika, konfigurację modelu oraz format odpowiedzi, aby zbudować ładunek zapytania.

2. **validateResponseFormat(response: any): boolean**  
   Sprawdza, czy odpowiedź API odpowiada zdefiniowanemu schematowi JSON.

3. **handleError(error: any): void**  
   Loguje błędy i uruchamia mechanizmy awaryjne; może zawierać logikę ponownych prób wykonania zapytania.

4. **configureHeaders(): Record<string, string>**  
   Tworzy niezbędne nagłówki HTTP, w tym tokeny uwierzytelniające.

5. **retryRequest(payload: RequestPayload): Promise<ResponseData>**  
   Implementuje logikę ponownych prób w przypadku przejściowych problemów, takich jak przekroczenie limitu czasu połączenia.

### Pola prywatne

- **_systemMessage: string**  
  Przechowuje bieżący komunikat systemowy.

- **_userMessage: string**  
  Przechowuje bieżący komunikat użytkownika.

- **_modelConfig: ModelConfig**  
  Przechowuje bieżącą konfigurację modelu (nazwa modelu oraz jego parametry).

- **_apiKey: string**  
  Bezpiecznie przechowywany klucz API do uwierzytelniania (wstrzykiwany przez zmienne środowiskowe).

- **_retries: number**  
  Konfigurowalna liczba ponownych prób w przypadku niepowodzenia zapytania.

---

## 5. Obsługa błędów

Strategia obsługi błędów w usłudze OpenRouter obejmuje następujące scenariusze:

1. **Błąd sieciowy**
   - Wykrywanie błędów połączenia lub przekroczenia limitu czasu.
   - *Rozwiązanie:* Implementacja logiki ponownych prób z wykładniczym opóźnieniem.

2. **Nieprawidłowy schemat odpowiedzi**
   - Odpowiedź API nie odpowiada oczekiwanemu schematowi JSON.
   - *Rozwiązanie:* Walidacja przy użyciu solidnej biblioteki do schematów JSON oraz logowanie niezgodności.

3. **Nieautoryzowany dostęp**
   - API zwraca błąd nieautoryzowanego dostępu (HTTP 401/403).
   - *Rozwiązanie:* Zatrzymanie dalszych zapytań oraz powiadomienie o konieczności weryfikacji klucza API/danych uwierzytelniających.

4. **Błędy po stronie serwera**
   - API zwraca błąd serwera (kod 5xx).
   - *Rozwiązanie:* Logowanie szczegółów błędu, uruchomienie procedur awaryjnych oraz powiadomienie odpowiednich służb o konieczności interwencji.

5. **Nieprawidłowy format ładunku zapytania**
   - Ładunek zapytania jest niepoprawnie sformatowany.
   - *Rozwiązanie:* Egzekwowanie zasad konstrukcji ładunku zapytania oraz przeprowadzenie wstępnej walidacji przed wysłaniem.

---

## 6. Kwestie bezpieczeństwa

Bezpieczeństwo jest kluczowe podczas komunikacji z zewnętrznymi API. Kluczowe kwestie bezpieczeństwa to:

1. **Zarządzanie kluczami API**
   - Przechowywanie kluczy API i wrażliwych danych uwierzytelniających w zmiennych środowiskowych lub za pomocą systemu zarządzania sekretami.

2. **Sanityzacja danych**
   - Walidacja i sanityzacja wszystkich wejść (komunikatów systemowych, komunikatów użytkownika), aby zapobiec atakom wstrzyknięcia kodu.

3. **Bezpieczna transmisja**
   - Używanie protokołu HTTPS dla całej komunikacji z API OpenRouter.

4. **Logowanie błędów**
   - Logowanie błędów bez ujawniania wrażliwych informacji.

5. **Kontrole dostępu**
   - Ograniczenie dostępu do endpointów konfiguracyjnych i zapewnienie, że metody usługi nie pozwalają na nieautoryzowane modyfikacje.

---

## 7. Plan wdrożenia krok po kroku

1. **Analiza wymagań**
   - Przegląd i dokumentacja szczegółowych wymagań przekazanych przez API OpenRouter (w tym oczekiwanych parametrów oraz formatu odpowiedzi).
   - Zdefiniowanie komunikatów systemowego (np. "You are an AI assistant specialized in chatting."), komunikatu użytkownika, nazwy modelu (np. "gpt-4") oraz parametrów modelu (np. temperature: 0.7).

2. **Projektowanie architektury usługi**
   - Zmapowanie kluczowych komponentów: Konstruktor zapytania, Parser odpowiedzi, Obsługa błędów oraz Menedżer konfiguracji.
   - Stworzenie modeli danych (np. `ServiceConfig`, `ModelConfig`, `ResponseFormat`).

3. **Implementacja konstruktora i ustawień publicznych**
   - Rozwój konstruktora usługi z inicjalizacją punktów końcowych API oraz bezpiecznym ładowaniem klucza API.
   - Upublicznienie metod umożliwiających aktualizację komunikatu systemowego, komunikatu użytkownika oraz konfiguracji modelu.

4. **Budowa metod wewnętrznych (buildRequestPayload, configureHeaders, itd.)**
   - Implementacja składania ładunku zapytania, zapewniająca integrację:
     - **Komunikat systemowy:** np. "You are an AI assistant specialized in chatting."
     - **Komunikat użytkownika:** Przykładowo, zapytanie klienta.
     - **format odpowiedzi (response_format):** np.,
       ```json
       {
         "type": "json_schema",
         "json_schema": {
           "name": "completionSchema",
           "strict": true,
           "schema": {
             "response": "string"
           }
         }
       }
       ```
     - **Nazwa modelu:** np. "gpt-4".
     - **Parametry modelu:** np. `{ "temperature": 0.7, "max_tokens": 150 }`.

5. **Implementacja obsługi błędów**
   - Integracja obsługi błędów dla przypadków takich jak błędy sieciowe, nieautoryzowany dostęp, czy niepoprawna walidacja odpowiedzi.
   - Testowanie scenariuszy błędów oraz implementacja logiki ponownych prób tam, gdzie jest to konieczne.

6. **Testowanie i walidacja funkcjonalności**
   - Pisanie testów jednostkowych dla każdej metody publicznej i prywatnych metod pomocniczych.
   - Przeprowadzenie testów integracyjnych symulujących rzeczywiste interakcje z API.
   - Walidacja, że format odpowiedzi (response_format) ściśle przestrzega oczekiwanego schematu.

7. **Dokumentacja i zabezpieczenia produkcyjne**
   - Uzupełnienie dokumentacji inline kodu oraz aktualizacja przewodników użycia.
   - Zapewnienie, że logi nie ujawniają wrażliwych danych.
   - Przeprowadzenie przeglądu bezpieczeństwa skoncentrowanego na sposobie przechowywania klucza API, sanityzacji żądań oraz odpowiedniej konfiguracji.

8. **Wdrożenie do środowiska produkcyjnego**
   - Wdrożenie usługi wraz z odpowiednią konfiguracją środowiskową.
   - Monitorowanie interakcji z API pod kątem nieoczekiwanych błędów i problemów wydajnościowych.
   - Uruchomienie systemu alertów oraz procedur awaryjnych umożliwiających szybkie reagowanie na incydenty.