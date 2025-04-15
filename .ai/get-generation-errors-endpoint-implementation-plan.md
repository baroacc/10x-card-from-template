# Plan wdrożenia endpointu API: Lista błędów generacji

## 1. Przegląd punktu końcowego
Punkt końcowy umożliwia uwierzytelnionym użytkownikom pobranie listy logów błędów generacji związanych z sesjami generacji AI. Logi pobierane są z tabeli `generation_error_logs` i filtrowane według `user_id` aktualnego użytkownika. Endpoint ma na celu ułatwienie diagnozowania problemów i przekazywanie informacji zwrotnych dotyczących błędów podczas generacji treści.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET  
- **Struktura URL:** `/api/generation-error-logs`
- **Parametry zapytania:**
  - **Wymagane:**
    - `page` (number): Numer aktualnej strony (dla paginacji).
  - **Opcjonalne:**
    - `limit` (number): Liczba rekordów na stronę (domyślnie ustalana w implementacji).
- **Nagłówki żądania:**
  - Nagłówek autoryzacji (np. Bearer token) do identyfikacji aktualnego użytkownika.

## 3. Wykorzystywane typy
- **DTOs:**
  - `GenerationErrorLogDTO` (z `src/types.ts`): Definiuje strukturę pojedynczego loga błędu generacji.
  - `PaginationDTO` (z `src/types.ts`): Zawiera informacje o paginacji (page, limit, total).
  - Opakowanie odpowiedzi:  
    ```typescript
    interface ListGenerationErrorLogsResponse {
      data: GenerationErrorLogDTO[];
      pagination: PaginationDTO;
    }
    ```
- **Modele komend:**  
  Nie ma dedykowanego modelu dla komend dla żądania GET, walidacja parametrów zapytania będzie realizowana przy użyciu schematu (np. z wykorzystaniem biblioteki zod).

## 4. Przepływ danych
1. **Uwierzytelnienie:**  
   Żądanie musi zawierać poprawne dane uwierzytelniające. Token jest używany do wyodrębnienia `user_id` aktualnego użytkownika.

2. **Walidacja danych wejściowych:**  
   Parametry zapytania (`page`, `limit`) są parsowane i walidowane (najlepiej przy użyciu zod). Wartości domyślne mogą być ustawiane, gdy parametry opcjonalne nie są podane.

3. **Warstwa serwisowa:**  
   - Utworzenie dedykowanego serwisu (np. `generationErrorLogService`), który obsługuje pobieranie logów z bazy danych.
   - Serwis korzysta z klienta Supabase przekazywanego w `context.locals` do wykonania zapytania do tabeli `generation_error_logs`, filtrując wyniki po `user_id` oraz stosując paginację (LIMIT + OFFSET).

4. **Przetwarzanie odpowiedzi:**  
   - Przekształcenie otrzymanych rekordów na tablicę obiektów `GenerationErrorLogDTO`.
   - Obliczenie lub pobranie informacji o paginacji (aktualna strona, limit, całkowita liczba wyników).
   - Zwrot danych w przejrzystej strukturze JSON.

## 5. Względy bezpieczeństwa
- **Uwierzytelnienie i autoryzacja:**  
  Endpoint musi być dostępny tylko dla uwierzytelnionych użytkowników. Należy poprawnie zweryfikować token i bezpiecznie wyekstrahować `user_id`.  
- **Walidacja danych wejściowych:**  
  Użycie zod do walidacji zapytań, aby uniemożliwić przesłanie niepoprawnych lub złośliwych danych.
- **Dostęp do danych:**  
  Logi błędów generacji muszą być filtrowane wyłącznie według `user_id`, aby zapobiec ujawnieniu danych innego użytkownika.

## 6. Obsługa błędów
- **400 Bad Request:**  
  Zwracany, gdy parametry zapytania są nieprawidłowe (np. wartości niebędące liczbami).
- **401 Unauthorized:**  
  Zwracany, gdy żądanie nie zawiera poprawnych danych uwierzytelniających.
- **403 Forbidden:**  
  W przypadku gdy użytkownik jest uwierzytelniony, ale nie ma uprawnień do wykonania danego żądania.
- **500 Internal Server Error:**  
  Dla niespodziewanych błędów lub problemów z dostępem do bazy danych.
- **Logowanie błędów:**  
  Szczegółowe logi błędów (np. stack trace) powinny być zapisywane dla celów diagnostycznych, przy jednoczesnym przesyłaniu przyjaznych komunikatów błędów do użytkownika.

## 7. Rozważania dotyczące wydajności
- **Efektywność zapytań:**  
  Użycie zapytań z paginacją (LIMIT oraz OFFSET) w celu obsługi dużych zbiorów danych.
- **Indeksowanie:**  
  Zapewnienie indeksu dla kolumny `user_id` w tabeli `generation_error_logs` w celu przyspieszenia filtrowania.
- **Caching:**  
  Rozważenie wdrożenia strategii cache’owania w przypadku dużego obciążenia serwera zapytań.

## 8. Etapy wdrożenia
1. **Konfiguracja trasy API:**  
   - Utworzenie nowego pliku w `src/pages/api/generation-error-logs.ts`.
   - Ograniczenie metody do GET.

2. **Walidacja danych wejściowych:**  
   - Zdefiniowanie schematu walidacji przy użyciu zod dla parametrów `page` oraz `limit`.
   - Ustawienie wartości domyślnych w przypadku braku parametrów.

3. **Implementacja uwierzytelnienia:**  
   - Integracja middleware lub logiki wbudowanej w danym endpointcie do uwierzytelnienia żądania oraz wyodrębnienia `user_id` z `context.locals`.

4. **Integracja warstwy serwisowej:**  
   - Utworzenie (lub aktualizacja) serwisu `generationErrorLogService` w katalogu `src/services`, który będzie odpowiedzialny za interakcję z bazą danych.
   - Wykorzystanie klienta Supabase z `context.locals` do wykonania zapytania na tabeli `generation_error_logs` z filtracją po `user_id` i zastosowaniem paginacji.

5. **Składanie odpowiedzi:**  
   - Mapowanie rekordów z bazy na strukturę `GenerationErrorLogDTO`.
   - Obliczenie danych paginacji oraz sformatowanie struktury zgodnie z `PaginationDTO`.
   - Zwrot odpowiedzi JSON z kodem statusu 200.

6. **Obsługa błędów:**  
   - Ustanowienie mechanizmów przechwytywania i obsługi błędów na etapie walidacji, uwierzytelnienia oraz pobierania danych.
   - Ustalanie odpowiednich kodów błędów (400, 401, 403, 500) oraz zapewnienie przyjaznych komunikatów do użytkownika.

7. **Testowanie:**  
   - Opracowanie testów integracyjnych sprawdzających poprawność działania endpointu dla różnych scenariuszy (prawidłowe/nieprawidłowe dane wejściowe, udane/nieudane uwierzytelnienie, puste wyniki).
   - Testowanie wydajności zapytań przy różnych ustawieniach paginacji.

8. **Dokumentacja i Code Review:**  
   - Udokumentowanie endpointu oraz logiki serwisowej.
   - Przegląd kodu zgodnie ze standardami projektu i zasadami czystego kodu.
   - Przeprowadzenie review przez zespół przed wdrożeniem.

9. **Deployment:**  
   - Scalanie zmian do głównej gałęzi oraz wdrożenie endpointu.
   - Monitorowanie metryk oraz logów po wdrożeniu i wprowadzanie ewentualnych poprawek krytycznych.