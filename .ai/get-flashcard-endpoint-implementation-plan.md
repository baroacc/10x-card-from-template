# API Endpoint Implementation Plan: Get Flashcard Details

## 1. Przegląd punktu końcowego
Endpoint służy do pobrania szczegółowych informacji o pojedynczej fiszce na podstawie jej identyfikatora. Zapewnia zwrócenie szczegółów rekordu z tabeli `flashcards`, w tym danych takich jak `front`, `back`, `source`, `status` oraz znacznika daty utworzenia/aktualizacji.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET  
- **Struktura URL:** `/api/flashcards/{flashcardId}`  
- **Parametry:**
  - **Wymagane:**  
    - `flashcardId` (integer) – identyfikator fiszki pobieranej z bazy danych.
  - **Opcjonalne:** Brak
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **DTO:**  
  - `FlashcardDTO` (zdefiniowany w `src/types.ts`) – zawiera pola: `id`, `front`, `back`, `source`, `generation_id`, `created_at` oraz `updated_at`.
- **Mechanizm autoryzacji:**  
  - Kontekst `supabase` pobierany z `context.locals` (zgodnie z zasadami backend.mdc).

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK):**  
  - JSON: Zawiera pełne dane fiszki zgodne z typem `FlashcardDTO`.
- **Błędy:**  
  - **401 Unauthorized:** Autoryzacja nie powiodła się – użytkownik nie jest zalogowany.
  - **404 Not Found:** Fiszka o podanym identyfikatorze nie istnieje lub nie należy do zalogowanego użytkownika.
  - **500 Internal Server Error:** Wystąpił wewnętrzny błąd serwera podczas przetwarzania żądania.

## 5. Przepływ danych
1. Żądanie jest wysyłane do endpointu z podanym `flashcardId` w URL.
2. Na etapie weryfikacji autoryzacji, pobieramy kontekst `supabase` oraz informację o zalogowanym użytkowniku.
3. Parametr `flashcardId` jest walidowany (sprawdzenie czy jest liczbą całkowitą).
4. Następuje zapytanie do tabeli `flashcards` w bazie danych:
   - Filtrowanie po `id` uzyskanym z URL
   - Dodatkowy filtr sprawdzający, czy `user_id` fiszki zgadza się z identyfikatorem zalogowanego użytkownika.
5. Jeśli rekord zostanie znaleziony, dane są zwracane w formacie JSON z kodem 200.
6. Jeśli nie zostanie znaleziony, endpoint zwraca błąd 404.
7. W przypadku wystąpienia błędów nieoczekiwanych (np. problem z bazą), zwracany jest błąd 500.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Upewnij się, że tylko zalogowani użytkownicy mogą uzyskać dostęp do danego zasobu. Weryfikuj `user_id` przypisane do fiszki.
- **Walidacja wejścia:**  
  - Sprawdzenie czy parametr `flashcardId` jest poprawną wartością (liczba całkowita).
- **Ochrona przed atakami:** Ograniczyć możliwości SQL Injection poprzez stosowanie mechanizmów ORM lub przygotowanych zapytań.
- **Obsługa nagłówków:** Weryfikacja tokena uwierzytelniającego przesyłanego w żądaniu.

## 7. Obsługa błędów
- **401 Unauthorized:** Jeśli użytkownik nie jest zalogowany, zwróć komunikat o braku autoryzacji.
- **404 Not Found:** Jeśli rekord o podanym `flashcardId` nie istnieje lub fizycznie nie należy do użytkownika, zwróć odpowiedni komunikat.
- **500 Internal Server Error:** W razie wystąpienia problemów z bazą lub nieprzewidzianych błędów, zwróć komunikat o błędzie serwera.
- Dodatkowo, logowanie błędów na serwerze w celu dalszej analizy.

## 8. Rozważania dotyczące wydajności
- **Indeksacja:** Upewnij się, że kolumna `id` (oraz być może `user_id`) w tabeli `flashcards` jest odpowiednio zindeksowana.
- **Optymalizacja zapytań:** Stosowanie ograniczeń, filtrowanie rekordów na poziomie zapytania, aby zminimalizować obciążenie bazy danych.
- **Cache:** Rozważ zastosowanie mechanizmów cache’ujących dla endpointu, jeżeli ruch jest wysoki i dane rzadko się zmieniają.

## 9. Etapy wdrożenia
1. **Tworzenie struktury endpointu:**
   - Utwórz plik w katalogu `/src/pages/api/flashcards/[flashcardId].ts` zgodnie z przyjętą strukturą projektu.
2. **Implementacja obsługi autoryzacji:**
   - Pobranie kontekstu `supabase` z `context.locals` i weryfikacja tożsamości użytkownika.
3. **Walidacja parametrów:**
   - Walidacja poprawności `flashcardId` (sprawdzenie czy jest liczbą całkowitą).
4. **Implementacja logiki pobierania danych:**
   - Utworzenie odpowiedniego zapytania do bazy danych w celu pobrania rekordu fiszki z uwzględnieniem filtra `user_id`.
5. **Zwracanie odpowiedzi:**
   - Przy znalezieniu rekordu, zwrócenie danych w formacie JSON wraz z kodem 200.
   - W przypadku braku rekordu, zwrócenie kodu 404.
6. **Obsługa błędów:**
   - Dodanie mechanizmów try/catch dla wychwycenia błędów oraz zwracania kodu 500 dla nieobsłużonych wyjątków.
   - Logowanie błędów dla celów debugowania.
7. **Testy:**
   - Opracowanie testów jednostkowych oraz integracyjnych dla endpointu, aby zweryfikować działanie w scenariuszach pozytywnych i negatywnych.
