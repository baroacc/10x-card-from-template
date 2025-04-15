# Plan wdrożenia endpointu API: Utwórz Flashcard

## 1. Przegląd punktu końcowego
Endpoint służy do zbiorczego tworzenia fiszek, umożliwiając jednocześnie ręczne dodawanie fiszek oraz zapisywanie fiszek generowanych przez AI. Endpoint wymusza rygorystyczne zasady walidacji danych i integruje operacje bazodanowe poprzez Supabase.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** `/api/flashcards`
- **Parametry:**
  - **Wymagane:** 
    - JSON zawierający właściwość `"flashcards"`, która jest niepustą tablicą.
    - Każdy obiekt fiszki musi zawierać:
      - `"front"`: ciąg znaków (maksymalnie 200 znaków).
      - `"back"`: ciąg znaków (maksymalnie 500 znaków).
      - `"source"`: ciąg znaków, przyjmujący jedną z wartości: `"manual"`, `"ai-full"` lub `"ai-edited"`.
  - **Opcjonalne:** 
    - `"generation_id"`: dodatnia liczba całkowita, jeśli jest podana.

- **Przykład treści żądania:**
  ```json
  {
    "flashcards": [
      {
        "front": "Przykładowa treść frontu",
        "back": "Przykładowa treść tyłu",
        "source": "manual",
        "generation_id": 45
      }
    ]
  }
  ```

## 3. Wykorzystywane typy
- **Request DTO:**
  - `CreateFlashcardsCommand` z pliku `@types.ts`, który zawiera tablicę `CreateFlashcardDto`.
- **Response DTO:**
  - `FlashcardDTO` – reprezentacja stworzonych fiszek.
- **Inne modele poleceń:**
  - Logika walidacji oraz konwersji danych wykorzysta istniejące typy zdefiniowane w projekcie.

## 4. Przepływ danych
1. **Autoryzacja:**
   - Sprawdzenie, czy żądanie jest autoryzowane (np. poprzez middleware Astro oraz autoryzację Supabase).
   - Identyfikator `user_id` powinien być pobierany z sesji użytkownika, a nie przekazywany przez klienta.

2. **Walidacja danych wejściowych:**
   - Wykorzystanie bibliotek takich jak Zod do stworzenia schematów walidacyjnych.
   - Walidacja obecności i niepustości tablicy `"flashcards"`.
   - Dla każdej fiszki: 
     - Pole `"front"` nie powinno przekraczać 200 znaków.
     - Pole `"back"` nie powinno przekraczać 500 znaków.
     - Pole `"source"` musi przyjmować jedną z określonych wartości.
     - Jeśli podane, `"generation_id"` musi być dodatnią liczbą całkowitą.

3. **Logika biznesowa i warstwa serwisowa:**
   - Przekazanie zwalidowanych danych do usługi znajdującej się w `/src/lib/services/flashcardService.ts`.
   - Usługa zajmuje się wykonaniem wszystkich operacji na bazie danych przy użyciu klienta Supabase (pozyskiwanego z `context.locals`).
   - Walidacja zapewnia również sprawdzenie zgodności `generation_id` z odpowiednim rekordem w tabeli `generations`.

4. **Operacje bazy danych:**
   - Zastosowanie wstawienia zbiorczego fiszek, aby zwiększyć efektywność operacji.
   - Użycie transakcji lub obsługi błędów bazodanowych przy operacjach wstawienia.

## 5. Względy bezpieczeństwa
- Endpoint musi być zabezpieczony – dane użytkownika (np. `user_id`) pobierane są na podstawie sesji, a nie z danych przesłanych przez klienta.
- Walidacja i sanityzacja wszystkich danych wejściowych w celu ochrony przed atakami SQL Injection i innymi wektorami ataku.
- Korzystanie z zapytań parametryzowanych przy użyciu SDK Supabase.
- Nie ujawnianie wewnętrznych szczegółów błędów w odpowiedziach API.

## 6. Obsługa błędów
- **400 Bad Request:** W przypadku braku żądanej tablicy `"flashcards"`, pustej tablicy lub naruszenia zasad walidacji (np. zbyt długie teksty, nieprawidłowy `"source"`, niepoprawny `"generation_id"`).
- **401 Unauthorized:** Gdy użytkownik nie jest autoryzowany.
- **500 Internal Server Error:** W przypadku niespodziewanych błędów podczas operacji na bazie danych lub wewnętrznych błędów serwera.

## 7. Rozważania dotyczące wydajności
- Wykorzystanie wstawienia zbiorczego (bulk insert) do operacji na wielu rekordach jednocześnie.
- Użycie pul połączeń (connection pooling) oferowanego przez Supabase.
- Optymalizacja schematów walidacyjnych (Zod) pod kątem minimalizacji narzutu wydajnościowego.
- Monitorowanie operacji logowania przy minimalnym wpływie na wydajność.

## 8. Etapy wdrożenia
1. **Konfiguracja endpointu:**
   - Utworzenie pliku endpointu w `/src/pages/api/flashcards.ts`.
   - Konfiguracja middleware odpowiedzialnych za autoryzację oraz obsługę błędów.

2. **Implementacja walidacji:**
   - Zdefiniowanie schematów walidacyjnych Zod dla `CreateFlashcardsCommand` i pojedynczej fiszki.
   - Wdrożenie walidacji w obsłudze żądania.

3. **Integracja warstwy serwisowej:**
   - Utworzenie lub aktualizacja usługi w `/src/pages/services/flashcard-service.ts` odpowiedzialnej za logikę biznesową oraz operacje bazodanowe.
   - Przeniesienie logiki walidacji błędów i wstawienia danych do warstwy serwisowej.

4. **Operacje na bazie danych:**
   - Użycie klienta Supabase z `context.locals` do wykonywania operacji insercji.
   - Wdrażanie mechanizmów transakcyjnych lub odpowiedniej obsługi błędów przy operacjach zbiorczych.

5. **Obsługa błędów i logowanie:**
   - Zapewnienie struktury obsługi błędów, która zwraca odpowiednie kody statusu HTTP.

6. **Testowanie:**
   - Przygotowanie testów jednostkowych oraz integracyjnych, obejmujących:
     - Prawidłowe żądania.
     - Żądania z naruszeniami reguł walidacyjnych.
     - Scenariusze błędów przy operacjach bazodanowych.
  
7. **Dokumentacja i przegląd kodu:**
   - Uaktualnienie dokumentacji API oraz kodu o szczegółowe opisy nowego endpointu.
   - Przeprowadzenie przeglądu kodu, aby upewnić się, że wdrożenie jest zgodne ze standardami projektu oraz zasadami implementacji.