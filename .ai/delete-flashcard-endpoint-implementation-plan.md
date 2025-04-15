# API Endpoint Implementation Plan: Delete Flashcard

## 1. Przegląd punktu końcowego
Endpoint odpowiada za "soft-delete" (oznaczenie jako nieaktywne) fiszki. Po otrzymaniu żądania DELETE, system powinien zaktualizować rekord fiszki w bazie danych, ustawiając pole `status` na `FALSE`, co oznacza, że fiszka została usunięta logicznie. Dodatkowo endpoint powinien zapewnić, że użytkownik jest upoważniony do wykonania tej operacji.

## 2. Szczegóły żądania
- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/flashcards/{flashcardId}`
- **Parametry:**
  - **Wymagane:**
    - `flashcardId` (integer) – ID fiszki, która ma zostać usunięta.
- **Request Body:** Brak, ponieważ wszystkie potrzebne dane przekazywane są poprzez parametr URL.

## 3. Wykorzystywane typy
- **DTO/Command:**
  - Nie jest wymagany dedykowany DTO do usunięcia, ponieważ operacja polega na aktualizacji statusu rekordu. Można wykorzystać istniejący model `FlashcardUpdateDTO`, aktualizując w nim właściwość `status` na `false`.
- **Inne typy:**
  - Typy związane z autoryzacją (np. token użytkownika) – powinny być weryfikowane w warstwie middleware lub w samym handlerze.

## 4. Przepływ danych
1. Klient wysyła żądanie DELETE na URL z podanym `flashcardId`.
2. Warstwa uwierzytelniania sprawdza, czy użytkownik jest zalogowany i posiada odpowiednie uprawnienia.
3. Handler endpointu pobiera `flashcardId` z parametru URL.
4. Usługa (service), dedykowana operacjom na fiszkach, weryfikuje istnienie rekordu o podanym ID oraz potwierdza, że fiszka należy do zalogowanego użytkownika.
5. Jeżeli fiszka istnieje i użytkownik ma uprawnienia, następuje aktualizacja rekordu w bazie danych – pole `status` ustawiane jest na `FALSE`.
6. W przypadku sukcesu endpoint zwraca odpowiedź z kodem 200 i komunikatem „Flashcard deleted successfully”.
7. W przypadku błędów (np. brak autoryzacji, nieistniejący rekord) zwracane są odpowiednie kody statusu 401, 404 lub 500.

## 5. Względy bezpieczeństwa
- Uwierzytelnianie: Endpoint musi sprawdzać, czy użytkownik jest zalogowany oraz czy posiada prawa do modyfikacji żądanej fiszki.
- Autoryzacja: Weryfikacja, czy żądana fiszka faktycznie należy do użytkownika wykonującego operację.
- Walidacja wejścia: Zapewnienie, że `flashcardId` jest poprawnym identyfikatorem (liczba całkowita) oraz, że rekord istnieje.
- Zapobieganie atakom: Sanityzacja parametrów i ochrona przed SQL Injection (głównie dzięki użyciu ORM lub parametrów zapytań).

## 6. Obsługa błędów
- **401 Unauthorized:** Gdy użytkownik nie jest zalogowany lub token autoryzacyjny jest nieważny.
- **404 Not Found:** Gdy fiszka o podanym `flashcardId` nie istnieje lub już została usunięta.
- **400 Bad Request:** Gdy `flashcardId` nie jest prawidłowym numerem (np. nie jest liczbą).
- **500 Internal Server Error:** Gdy wystąpił nieoczekiwany błąd na serwerze podczas aktualizacji rekordu.

## 7. Rozważania dotyczące wydajności
- Operacja aktualizacji jednego rekordu nie jest intensywna, ale należy zadbać o odpowiednie indeksowanie kolumny `id` w tabeli oraz o sprawne przetwarzanie zapytań.
- W przypadku dużej liczby zapytań warto sprawdzić obciążenie bazy danych i ewentualnie wdrożyć mechanizmy cache’owania lub rozproszenia bazy danych.

## 8. Etapy wdrożenia
1. **Przygotowanie schematu bazy danych:**  
   Upewnij się, że tabela `flashcards` posiada kolumnę `status` i że domyślnie ustawiona jest na `TRUE`. W razie potrzeby przygotuj dodatkowe migracje.
   
2. **Implementacja middleware:**  
   Dodaj middleware sprawdzające uwierzytelnienie użytkownika oraz autoryzację dla operacji na fiszkach.
   
3. **Stworzenie serwisu:**  
   - Utwórz lub zaktualizuj serwis (np. `flashcard.service`), który będzie obsługiwał operację "soft-delete".  
   - W serwisie zaimplementuj funkcję, która:
     - Pobierze fiszkę przez `flashcardId`.
     - Sprawdzi, czy fiszka należy do zalogowanego użytkownika.
     - Zaktualizuje kolumnę `status` na `FALSE`.
   
4. **Implementacja endpointu:**  
   - Utwórz nowy handler w katalogu `/src/pages/api/flashcards/[flashcardId].ts` (lub odpowiednim, zgodnie z projektem).  
   - Upewnij się, że handler:
     - Pobiera `flashcardId` z parametrów URL.
     - Wywołuje funkcję z warstwy serwisu.
     - Obsługuje odpowiedzi dla poszczególnych błędów oraz sukces.
   
5. **Walidacja danych wejściowych:**  
   - Zaimplementuj walidację `flashcardId` (sprawdzenie, czy jest liczbą).
   - Użyj bibliotek takich jak Zod, zgodnie z wytycznymi dla backendu, do walidacji.
   
6. **Testy:**  
   - Napisz testy jednostkowe dla serwisu oraz integracyjne dla endpointu, aby upewnić się, że wszystkie scenariusze (sukces, błędy autoryzacji, nieistniejąca fiszka) są poprawnie obsługiwane.
   
7. **Dokumentacja:**  
   - Uaktualnij dokumentację API, opisując endpoint, wymagane parametry, przykłady odpowiedzi oraz kody błędów.