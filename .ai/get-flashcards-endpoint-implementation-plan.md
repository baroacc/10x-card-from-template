# Plan wdrożenia endpointu API: List User Flashcards

## 1. Przegląd punktu końcowego
Endpoint umożliwia pobranie listy flashcards (karteczek) użytkownika, z możliwością paginacji, filtrowania i sortowania. Pozwala to użytkownikowi na wygodne przeglądanie swoich flashcards, jednocześnie dbając o bezpieczeństwo i wydajność.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET  
- **Struktura URL:** `/api/flashcards`
- **Parametry zapytania:**
  - **Wymagane:**  
    - Żadne wymagane parametry (uwierzytelnianie realizowane przez middleware lub kontekst).
  - **Opcjonalne:**  
    - `page` (integer): Numer bieżącej strony (domyślnie np. 1).
    - `limit` (integer): Liczba flashcards na stronę (domyślnie np. 10 lub 20).
    - `search` (string): Zapytanie wyszukujące, pozwalające filtrować flashcards po zawartości (aplikowane do pól takich jak `front` lub `back`).
    - `sortBy` (string): Pole, według którego ma nastąpić sortowanie (np. `created_at`).
    - `order` (string): Kolejność sortowania, `asc` lub `desc`.

## 3. Wykorzystywane typy
- **DTO:**
  - `FlashcardDTO` – reprezentuje podstawową strukturę flashcard.
  - `FlashcardListResponseDTO` – opakowuje tablicę flashcards wraz z obiektem `PaginationDTO`, zawierającym informacje o paginacji.
- **Modele/Commandy:**
  - Dla endpointów GET nie występuje dedykowany command, ale w logice serwisu można zastosować model obiektu zapytań, który zawiera parametry: `page`, `limit`, `search`, `sortBy` i `order`.

## 4. Szczegóły odpowiedzi
- **Pomyślny Response (200 OK):**
  ```json
  {
    "data": [
      {
        "id": 123,
        "front": "Sample question",
        "back": "Sample answer",
        "source": "ai-full",
        "status": true,
        "created_at": "2023-10-01T12:00:00Z",
        "updated_at": "2023-10-01T12:00:00Z",
        "generation_id": 45,
        "user_id": "uuid-string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50
    }
  }
  ```
- **Kody błędów:**
  - `401 Unauthorized`: Brak autoryzacji użytkownika.
  - `400 Bad Request`: Nieprawidłowe parametry zapytania.
  - `500 Internal Server Error`: Błąd serwera lub problem z bazą danych.

## 5. Przepływ danych
1. **Przyjęcie żądania:**  
   Endpoint odbiera żądanie GET na `/api/flashcards` z opcjonalnymi parametrami zapytania.
2. **Uwierzytelnianie i autoryzacja:**  
   Middleware lub kontroler ekstraktuje kontekst użytkownika (np. z `context.locals` przy użyciu Supabase). Flashcards są pobierane tylko dla zalogowanego użytkownika.
3. **Walidacja danych wejściowych:**  
   Parametry zapytania są walidowane przy użyciu biblioteki (np. Zod). Należy sprawdzić, czy `page` i `limit` są dodatnimi liczbami, a `order` przyjmuje wartość `asc` lub `desc`.
4. **Interakcja z warstwą serwisu:**  
   Kontroler przekazuje zweryfikowane dane do warstwy serwisowej, która buduje zapytanie do bazy (np. poprzez Supabase) stosując filtrowanie, sortowanie oraz paginację.
5. **Agregacja danych i odpowiedź:**  
   Serwis zwraca dane odpowiadające strukturze `FlashcardListResponseDTO`, zawierając listę flashcards oraz obiekt paginacji (numer strony, limit i całkowitą liczbę rekordów).
6. **Wysyłka odpowiedzi:**  
   API zwraca przygotowaną odpowiedź JSON z kodem statusu `200`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:**  
  Każde zapytanie musi być uwierzytelnione. Zapytania bez poprawnych tokenów powinny zwracać kod `401 Unauthorized`.
- **Autoryzacja:**  
  Sprawdź, aby użytkownik otrzymywał wyłącznie swoje własne flashcards.
- **Walidacja danych:**  
  Użyj Zod lub podobnej biblioteki do walidacji parametrów zapytania, aby zapobiec atakom typu injection i błędnym zapytaniom.
- **Ograniczenie zakresu danych:**  
  Stosuj paginację oraz limitowanie danych, aby zapobiec przeciążeniu systemu (np. atakom typu denial-of-service).

## 7. Obsługa błędów
- **Nieprawidłowe dane wejściowe (400):**  
  Jeśli parametry `page`, `limit` lub `order` są niepoprawne, zwróć komunikat błędu z kodem `400 Bad Request`.
- **Brak autoryzacji (401):**  
  W przypadku braku lub błędnych danych uwierzytelniających zwróć `401 Unauthorized`.
- **Zasób nie znaleziony (404):**  
  Choć dla listowania flashcards nie jest to częsty przypadek, kod 404 może być zwracany, jeśli flashcards dla danego użytkownika nie zostaną odnalezione.
- **Błąd serwera (500):**  
  Dla niespodziewanych błędów lub wyjątków (np. problemy z bazą) zwróć `500 Internal Server Error` i odpowiednio zaloguj błąd.

## 8. Rozważenia dotyczące wydajności
- **Paginacja:**  
  Stosuj zapytania z LIMIT i OFFSET, aby pobierać tylko niezbędne rekordy.
- **Indeksowanie:**  
  Rozważ dodanie indeksów na polach używanych w filtrowaniu i sortowaniu (np. `created_at`, `user_id`, oraz pól tekstowych używanych w wyszukiwaniu).
- **Optymalizacja zapytań:**  
  Upewnij się, że budowane zapytania są efektywne i nie obciążają bazy nadmiernie.
- **Caching:**  
  Rozważ zastosowanie cache na poziomie zapytań, jeśli dane nie muszą być od razu aktualne.

## 9. Etapy wdrożenia
1. **Utworzenie endpointu i konfiguracja middleware:**
   - Zaktualizuj lub utwórz gdy nie istnieje nowy plik endpointu (np. w `/src/pages/api/flashcards.ts`) obsługujący metodę GET.
   - Upewnij się, że middleware uwierzytelniające jest poprawnie skonfigurowane.
2. **Walidacja danych wejściowych:**
   - Opracuj i wdroż schemat walidacji parametrów zapytania (np. przy użyciu Zod) dla parametrów `page`, `limit`, `search`, `sortBy` oraz `order`.
3. **Implementacja warstwy serwisowej:**  
   - Dodaj lub uzupełnij serwis (np. w `/src/services`), który będzie przyjmował zweryfikowane dane zapytania.
   - Zaimplementuj logikę zapytań do bazy danych przy użyciu Supabase, filtrując flashcards tylko dla zalogowanego użytkownika.
4. **Budowa zapytań do bazy danych:**
   - Stwórz dynamiczne zapytania uwzględniające filtrowanie, sortowanie i paginację.
   - Zadbaj o optymalizację zapytań poprzez indeksowanie stosownych kolumn.
5. **Przygotowanie odpowiedzi:**
   - Przekształć wynik zapytania do struktury odpowiadającej `FlashcardListResponseDTO`.
   - Upewnij się, że pola `data` oraz `pagination` są poprawnie uzupełnione.
6. **Implementacja obsługi błędów i logowania:**
   - Dodaj mechanizmy przechwytywania błędów (np. obsługa wyjątków serwera) i logowania błędów (możliwe logowanie do tabeli błędów lub systemu logowania).
   - Przygotuj odpowiedzi z właściwymi kodami błędów (400, 401, 500).
7. **Testowanie endpointu:**
   - Napisz testy jednostkowe i integracyjne, aby zweryfikować działanie endpointu.
   - Sprawdź scenariusze uwierzytelnienia, walidacji, pobierania danych oraz obsługi błędów.
8. **Dokumentacja:**
   - Uaktualnij dokumentację API, opisując parametry zapytania oraz przykładowe odpowiedzi.
9. **Przegląd kodu i wdrożenie:**
   - Przeprowadź code review z zespołem.
   - Wdróż endpoint i monitoruj logi pod kątem ewentualnych błędów lub nieprawidłowości.