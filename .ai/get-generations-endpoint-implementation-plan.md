# Plan wdrożenia punktu końcowego API: Pobieranie sesji generacji AI

## 1. Przegląd punktu końcowego
Endpoint ma za zadanie zwrócić listę sesji generacji AI powiązanych z aktualnie uwierzytelnionym użytkownikiem. Umożliwia on pobranie paginowanej listy rekordów z tabeli `generations` wraz z metadanymi dotyczącymi paginacji. Punkt końcowy obsługuje metodę HTTP GET pod ścieżką `/api/generations`.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET  
- **Struktura URL:** `/api/generations`  
- **Parametry zapytania (Query Parameters):**
  - **Wymagane:**  
    - Brak bezpośrednio wymaganych parametrów – autoryzacja jest kluczowym wymogiem.
  - **Opcjonalne:**  
    - `page` (liczba): numer strony, domyślnie 1.
    - `limit` (liczba): liczba rekordów na stronę, domyślnie 10.
    - Dodatkowe parametry filtrujące lub sortujące mogą być rozbudowane w przyszłości.
- **Treść żądania (Request Body):**  
  - Brak – metoda GET nie posiada ciała żądania.

## 3. Wykorzystywane typy
Na podstawie dostarczonych definicji typów oraz specyfikacji API, w implementacji wykorzystamy następujące dto i modele:
- **Encja Generation:** Reprezentuje rekord z tabeli `generations` z właściwościami takimi jak `id`, `user_id`, `ai_model`, `generated_count`, `accepted_unedited_count`, `accepted_edited_count`, `source_text_hash`, `source_text_length`, `generation_duration`, `created_at` oraz `updated_at`.
- **PaginationDTO:** Zawiera informacje paginacyjne: `page`, `limit` oraz `total`.
- **Response DTO:**  
  - Odpowiedź zwracana przez endpoint powinna zawierać:
    ```json
    {
      "data": [ ... lista sesji generacji ... ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 20
      }
    }
    ```

## 4. Szczegóły odpowiedzi
- **Odpowiedź pomyślna (200 OK):**  
  - Zwraca obiekt JSON z:
    - `data`: tablica obiektów sesji generacji.
    - `pagination`: obiekt zawierający `page`, `limit` i `total`.
- **Możliwe kody błędów:**
  - **401 Unauthorized:** Użytkownik nie jest uwierzytelniony.
  - **400 Bad Request:** Nieprawidłowe parametry zapytania (np. nie-numeryczne wartości `page` lub `limit`).
  - **500 Internal Server Error:** Wystąpił nieoczekiwany błąd po stronie serwera.

## 5. Przepływ danych
1. **Odbiór żądania:**  
   - Endpoint odbiera żądanie GET pod adresem `/api/generations` wraz z opcjonalnymi parametrami paginacyjnymi.
2. **Uwierzytelnianie i autoryzacja:**  
   - Weryfikacja tokenu bądź sesji w celu potwierdzenia, że żądanie pochodzi od uwierzytelnionego użytkownika.
3. **Walidacja danych wejściowych:**  
   - Sprawdzenie i oczyszczenie parametrów `page` oraz `limit`.
4. **Interakcja z warstwą serwisową:**  
   - Wywołanie funkcji serwisowej odpowiedzialnej za pobieranie danych. Funkcja ta:
     - Użyje `user_id` uwierzytelnionego użytkownika do filtrowania rekordów w tabeli `generations`.
     - Zastosuje paginację na poziomie zapytania do bazy danych.
     - Przekształci pobrane dane na odpowiedni DTO.
5. **Tworzenie odpowiedzi:**  
   - Zwrócenie danych z informacjami paginacyjnymi w formacie JSON.
6. **Wysyłka odpowiedzi:**  
   - Odpowiedź zwrotna z kodem 200 OK oraz strukturą opisaną w sekcji 4.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:**  
  - Endpoint będzie dostępny wyłącznie dla uwierzytelnionych użytkowników.
- **Autoryzacja:**  
  - Usługa musi filtrować rekordy `generations` na podstawie `user_id` uwierzytelnionego użytkownika, aby uniemożliwić dostęp do danych innych użytkowników.
- **Walidacja danych:**  
  - Walidacja i oczyszczanie parametrów zapytania dla ochrony przed atakami typu injection oraz przed przesłaniem nieprawidłowych danych.
- **Ograniczenie danych:**  
  - Zwracane będą tylko niezbędne informacje z bazy danych, aby nie ujawniać wrażliwych danych.

## 7. Obsługa błędów
- **400 Bad Request:**  
  - Zwracany w przypadku niepoprawnie sformułowanych parametrów zapytania.
- **401 Unauthorized:**  
  - W przypadku braku poprawnej autoryzacji użytkownika.
- **500 Internal Server Error:**  
  - W przypadku wystąpienia nieoczekiwanego błędu.
  
W przypadku wystąpienia błędu, logowanie powinno być przeprowadzone w warstwie serwisowej. Może być również dodany mechanizm zapisu błędów do tabeli `generation_error_logs`, zawierającej szczegóły błędu, identyfikator użytkownika, hash tekstu źródłowego itp.

## 8. Rozważania dotyczące wydajności
- **Paginacja:**  
  - Wdrażanie paginacji na poziomie zapytania w bazie danych, aby nie ładować niepotrzebnej ilości danych.
- **Indeksacja:**  
  - Upewnienie się, że tabela `generations` posiada odpowiednie indeksy, zwłaszcza na kolumnie `user_id`, co przyspieszy filtrowanie wyników.
- **Skalowalność:**  
  - W przypadku rosnącej liczby rekordów sesji generacji, rozważyć wykorzystanie technik cache’owania wyników.
- **Optymalizacja zapytań:**  
  - Pobierać jedynie niezbędne kolumny, aby zmniejszyć obciążenie I/O.

## 9. Etapy wdrożenia
1. **Konfiguracja punktu końcowego:**  
   - Utworzenie nowej trasy w backendzie obsługującej metodę GET pod ścieżką `/api/generations`.
2. **Implementacja warstwy serwisowej:**  
   - Stworzenie lub rozszerzenie istniejącej usługi (np. `generationService`), która:
     - Waliduje parametry wejściowe.
     - Wykonuje zapytanie do bazy danych z użyciem filtra na `user_id`.
     - Zwraca wyniki wraz z danymi paginacyjnymi.
3. **Walidacja parametrów:**  
   - Dodanie middleware lub reguł walidacyjnych sprawdzających poprawność parametrów `page` i `limit`.
4. **Integracja zabezpieczeń:**  
   - Dodanie middleware obsługującego uwierzytelnianie oraz autoryzację.
5. **Obsługa błędów i logowanie:**  
   - Realizacja mechanizmu obsługi błędów w warstwie serwisowej oraz logowania potencjalnych błędów.  
   - Ewentualne zapisanie błędów w tabeli `generation_error_logs`.
6. **Optymalizacja bazy danych:**  
   - Sprawdzenie oraz wprowadzenie indeksów na kolumnach tabeli `generations`, jeśli to konieczne.
7. **Testowanie:**  
   - Opracowanie testów jednostkowych oraz integracyjnych sprawdzających:
     - Poprawność filtrowania danych wg. `user_id`.
     - Funkcjonalność paginacji.
     - Obsługę przypadków niepoprawnych danych wejściowych oraz błędów autoryzacji.
8. **Dokumentacja:**  
   - Aktualizacja dokumentacji API dotyczącej nowego endpointu, uwzględniając strukturę żądań, odpowiedzi oraz potencjalne kody błędów.