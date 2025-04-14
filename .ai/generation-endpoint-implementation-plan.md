# API Endpoint Implementation Plan: Create New AI Generation Session

## 1. Przegląd punktu końcowego
Endpoint służy do inicjacji nowej sesji generacji treści flashcardów na podstawie tekstu przesłanego przez użytkownika. Akcja ta wywołuje proces generacji propozycji flashcardów, zapisuje sesję generacji w bazie oraz w przypadku błędów – loguje je w tabeli `generation_error_logs`. Jego zadaniem jest:
- Walidacja danych wejściowych (pole `source_text`)
- Wywołanie zewnętrznego serwisu AI w celu generacji propozycji fiszek
- Zapis danych w bazie danych
- Zwrot wygenerowanych propozycji fiszek oraz liczby wygenerowanych obiektów

## 2. Szczegóły żądania
- **Metoda HTTP:** POST  
- **Struktura URL:** `/api/generations`  
- **Parametry:**  
  - Wymagane:  
    - `source_text` (string) – tekst dostarczony przez użytkownika.  
      - Walidacja: długość tekstu musi mieścić się w przedziale od 1000 do 10000 znaków.
- **Request Body:**  
  ```json
  {
    "source_text": "User submitted text"
  }
  ```

## 3. Wykorzystywane typy
- **Command/DTO Modele:**  
  - `GenerateFlashcardsCommand` (zawiera pole `source_text`).
  - `CreateGenerationResponseDTO` (zawiera: `generation_id`, `generated_count`, `flashcards_proposals`).
- **Flashcard Proposal Model:**  
  - `FlashCardProposalDTO` (z polami: `front`, `back`, `source` – gdzie wartość `source` musi być "ai-full").

## 4. Szczegóły odpowiedzi
- **Kod odpowiedzi przy sukcesie:** 201 Created  
- **Struktura odpowiedzi:**  
  ```json
  {
    "generation_id": 45,
    "generated_count": 10,
    "flashcards_proposals": [
      {
        "front": "front text",
        "back": "back text",
        "source": "ai-full"
      }
    ]
  }
  ```
- **Kody błędów:**  
  - 400 Bad Request – nieprawidłowe dane wejściowe (np. zbyt krótki/długi `source_text`).
  - 401 Unauthorized – brak autoryzacji.
  - 500 Internal Server Error – błędy wewnętrzne, w tym problemy z generacją lub zapisem do bazy.

## 5. Przepływ danych
1. Użytkownik wysyła żądanie POST do `/api/generations` z polem `source_text` w ciele żądania.
2. Warstwa kontrolera (API endpoint) waliduje wejściowe dane, za pomocą biblioteki `zod`:
   - Sprawdzenie obecności pola `source_text`.
   - Weryfikacja długości tekstu, aby spełniał wymogi (1000 - 10000 znaków).
3. Po poprawnej walidacji, przekazywanie żądania do warstwy serwisowej (`generations.service`):
   - Utworzenie nowej sesji w tabeli `generations` z niezbędnymi danymi, w tym hash tekstu, długością oraz metadanymi (id użytkownika, model AI, itp.).
   - Przeprowadzenie logiki wywołania modelu AI (przez Openrouter.ai) dla wygenerowania propozycji flashcardów.
   - Zapis wygenerowanych flashcardów do tabeli `flashcards` oraz powiązanie ich z sesją poprzez `generation_id`.
4. W przypadku wystąpienia błędów podczas generacji lub przetwarzania, logowanie szczegółów błędu do tabeli `generation_error_logs`. 
5. Po zakończeniu operacji, przygotowanie odpowiedzi zgodnie z `CreateGenerationResponseDTO` i zwrócenie odpowiedzi z kodem 201.

## 6. Względy bezpieczeństwa
- **Autentykacja:** Endpoint powinien być zabezpieczony mechanizmem weryfikacji (np. token JWT, sesje), aby zapewnić, że dostęp uzyskują tylko autoryzowani użytkownicy.
- **Autoryzacja:** Upewnić się, że użytkownik ma uprawnienia do inicjacji sesji generacji.
- **Walidacja danych:** Szczegółowa walidacja pól wejściowych, aby zapobiec atakom typu SQL Injection lub przekroczeniu limitów długości tekstu.
- **Bezpieczeństwo API kluczy:** Przy wywoływaniu modeli AI upewnij się, że klucze API nie są ujawnione oraz są przechowywane w bezpiecznym magazynie.

## 7. Obsługa błędów
- **400 Bad Request:**  
  - Brak pola `source_text` lub tekst spoza wymaganego przedziału długości.
- **401 Unauthorized:**  
  - Wywołanie endpointa przez niezautoryzowanego użytkownika.
- **500 Internal Server Error:**  
  - Błędy podczas operacji na bazie danych.
  - Błędy komunikacji z zewnętrznym API dla generacji flashcardów.
  - Problemy z logiką serwisową (np. błędy podczas zapisu w `generation_error_logs`).

W przypadku błędu generacji, szczegóły błędu (kod, wiadomość, model AI, hash tekstu itp.) powinny zostać zapisane w tabeli `generation_error_logs`.

## 8. Rozważania dotyczące wydajności
- **Optymalizacja zapytań:** Wykorzystanie odpowiednich indeksów zwłaszcza w tabelach `generations` i `flashcards`.
- **Asynchroniczność:** Rozważenie użycia asynchronicznych operacji wywołania API modelu AI, aby nie blokować głównego wątku.
- **Obsługa dużych danych:** W przypadku bardzo długich tekstów zadbać o odpowiednią optymalizację przetwarzania oraz o ograniczenie czasu odpowiedzi.

## 9. Etapy wdrożenia
1. **Analiza i projektowanie:**
   - Zapoznanie zespołu z wymaganiami oraz istniejącą architekturą bazy danych i systemem autoryzacji.
   - Weryfikacja typów dostępnych w `@types.ts` oraz sprawdzenie zgodności z modelem danych.
2. **Implementacja walidacji wejścia:**
   - Dodanie walidacji w warstwie kontrolera, aby wymusić obecność `source_text` oraz sprawdzić przedział długości.
3. **Rozwój logiki serwisowej:**
   - Utworzenie lub rozszerzenie serwisu odpowiedzialnego za generację flashcardów.
   - Integracja z zewnętrznym API (Openrouter.ai) do pobrania generowanych propozycji. Na etapie developmentu skorzystamy z mocków zamiast wywoływania serwisu AI.
   - Zapis danych do tabel `generations` i `flashcards`.
4. **Rejestracja błędów:**
   - Implementacja mechanizmu logowania błędów do tabeli `generation_error_logs` w przypadku nieprawidłowej odpowiedzi lub błędów komunikacji.
5. **Testy automatyczne i manualne:**
   - Przygotowanie testów jednostkowych i integracyjnych dla endpointa.
   - Testy walidacji danych wejściowych oraz scenariuszy błędów.
6. **Przegląd kodu oraz wdrożenie:**
   - Code review przez zespół.
   - Wdrożenie na środowisko stagingowe i przeprowadzenie testów wydajnościowych.
