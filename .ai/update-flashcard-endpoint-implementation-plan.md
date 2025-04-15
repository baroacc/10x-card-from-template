# Plan wdrożenia punktu końcowego API: Aktualizacja Flashcard

## 1. Przegląd punktu końcowego
Punkt końcowy umożliwia aktualizację istniejącej fiszki zidentyfikowanej na podstawie jej identyfikatora. Przyjmuje on zmiany w polach `front` oraz `back` (oraz opcjonalnie `source`), waliduje dane wejściowe według określonych ograniczeń dotyczących długości i wartości, oraz zapisuje zmiany w bazie danych, dbając o spójność danych.

## 2. Szczegóły żądania
- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/flashcards/{flashcardId}`
- **Parametry:**
  - **Wymagane (Parametr ścieżki):**
    - `flashcardId` (integer): Identyfikator fiszki do aktualizacji.
  - **Body żądania:**
    - **Wymagane:**
      - `front` (string): Zaktualizowany tekst frontu. Maksymalna długość 200 znaków.
      - `back` (string): Zaktualizowany tekst tyłu. Maksymalna długość 500 znaków.
    - **Opcjonalne:**
      - `source` (string): Jeśli zostanie podany, wartość może być tylko `"manual"` lub `"ai-edited"`.

- **Przykład żądania:**
```json
{
  "front": "Zaktualizowany tekst frontu",
  "back": "Zaktualizowany tekst tyłu"
}
```

## 3. Wykorzystywane typy
- **DTO i modele poleceń:**
  - `FlashcardUpdateDTO` (zdefiniowany w `src/types.ts`): Reprezentuje model aktualizacji, który umożliwia modyfikację pól `front`, `back`, `source` oraz opcjonalnie `generation_id`.
  - Przyjmowany ładunek żądania jest walidowany i mapowany do odpowiedniego modelu aktualizacji.

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK):** Zwraca zaktualizowany obiekt fiszki zawierający klucze:
  - `id`, `front`, `back`, `source`, `status`, `created_at`, `updated_at`, `generation_id`, `user_id`.
  
- **Kody błędów:**
  - **400 Bad Request:** W przypadku błędów walidacji (np. przekroczona długość tekstu lub nieprawidłowa wartość `source`).
  - **401 Unauthorized:** Gdy żądanie pochodzi od użytkownika niezalogowanego.
  - **404 Not Found:** Gdy fiszka o podanym `flashcardId` nie istnieje.
  - **500 Internal Server Error:** W przypadku nieoczekiwanych błędów serwera.

## 5. Przepływ danych
1. **Odbiór żądania:** API otrzymuje żądanie PUT na ścieżce `/api/flashcards/{flashcardId}`.
2. **Ekstrakcja parametrów:** Identyfikator `flashcardId` pobierany jest ze ścieżki, a treść żądania (JSON) jest parsowana.
3. **Walidacja danych wejściowych:**
   - Sprawdzenie, czy `front` jest ciągiem znaków o maksymalnej długości 200 znaków.
   - Sprawdzenie, czy `back` jest ciągiem znaków o maksymalnej długości 500 znaków.
   - Jeśli podana, walidacja, czy `source` przyjmuje wartość `"manual"` lub `"ai-edited"`.
4. **Uwierzytelnianie i autoryzacja:** Weryfikacja, czy użytkownik jest zalogowany oraz czy ma prawo edytować daną fiszkę (np. sprawdzenie własności).
5. **Warstwa serwisowa:**
   - Przekazanie zwalidowanych danych do dedykowanego serwisu (np. `flashcardService` umieszczonego w katalogu `/src/services`).
   - Warstwa serwisowa odpowiada za interakcję z bazą danych przy użyciu klienta Supabase (pobranym z `context.locals`).
6. **Operacja aktualizacji w bazie danych:**
   - Wykonanie operacji aktualizacji rekordu w tabeli `flashcards`.
   - Upewnienie się, że pole `updated_at` jest poprawnie aktualizowane (poprzez wyzwalacz lub logikę w serwisie).
7. **Formowanie odpowiedzi:** Zwrócenie zaktualizowanych danych fiszki do klienta.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:**
  - Endpoint musi być zabezpieczony tak, aby tylko uwierzytelnieni użytkownicy mogli dokonać aktualizacji.
  - Sprawdzenie, czy użytkownik posiada prawa dostępu do edycji danej fiszki.
- **Walidacja danych:** Wykorzystanie Zod lub podobnej biblioteki do walidacji i sanitizacji danych wejściowych.
- **Bezpieczeństwo bazy danych:** Używanie klienta Supabase z `context.locals` zamiast bezpośredniego importu, co zwiększa bezpieczeństwo operacji.
- **Sanityzacja:** Opcjonalnie dodatkowe zabezpieczenia przed atakami typu injection poprzez odpowiednie sanityzowanie danych wejściowych.

## 7. Obsługa błędów
- **400 Bad Request:** Gdy walidacja danych wejściowych nie powiedzie się (np. przekroczona długość tekstu lub nieprawidłowa wartość `source`).
- **401 Unauthorized:** Gdy użytkownik nie jest uwierzytelniony.
- **404 Not Found:** Gdy fiszka o podanym identyfikatorze nie istnieje.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów po stronie serwera.

## 8. Rozważania dotyczące wydajności
- **Indeksacja:** Upewnienie się, że pole `flashcardId` jest indeksowane dla szybkiego odczytu.
- **Transakcje:** Użycie transakcji w bazie danych, aby zapewnić spójność operacji aktualizacji.
- **Optymalizacja warstwy serwisowej:** Wyodrębnienie logiki aktualizacji do dedykowanego serwisu, co umożliwia przyszłą optymalizację (np. cachowanie wyników).
- **Pooling połączeń:** Wykorzystanie mechanizmów poolingowych oferowanych przez Supabase do efektywnego zarządzania połączeniami z bazą danych.

## 9. Etapy wdrożenia
1. **Walidacja danych wejściowych:**
   - Zdefiniowanie lub aktualizacja schematu walidacji Zod dla payloadu aktualizacji (z uwzględnieniem długości i dozwolonych wartości).
2. **Integracja middleware:**
   - Implementacja lub aktualizacja middleware do uwierzytelniania i autoryzacji, zabezpieczająca endpoint.
3. **Implementacja warstwy serwisowej:**
   - Utworzenie lub rozszerzenie serwisu `flashcard.service` w katalogu `/src/services` o metodę `updateFlashcard` obsługującą walidację i operację na bazie danych.
4. **Aktualizacja bazy danych:**
   - Wykonanie operacji aktualizacji rekordu oraz konfiguracja wyzwalacza aktualizującego pole `updated_at` (o ile nie jest to realizowane przez serwis).
5. **Obsługa błędów:**
   - Implementacja mechanizmu obsługi wyjątków w warstwie serwisowej oraz odpowiednie logowanie błędów.
6. **Testowanie:**
   - Przygotowanie testów jednostkowych oraz integracyjnych, obejmujących scenariusze poprawnego działania (happy path) oraz różne przypadki błędów (błędy walidacji, nieautoryzowany dostęp, brak rekordu, itp.).
7. **Dokumentacja:**
   - Aktualizacja dokumentacji API oraz komentarzy w kodzie, tak aby odzwierciedlały zmiany w zachowaniu endpointu.