# Plan implementacji widoku Flashcards

## 1. Przegląd
Widok „Flashcards” służy do przeglądania, edytowania, usuwania oraz tworzenia nowych fiszek. Zarówno edycja, jak i tworzenie nowych fiszek odbywa się za pomocą modalu. Użytkownik może wyszukiwać fiszki, przeprowadzać paginację, edytować wybraną fiszkę lub otworzyć modal do tworzenia nowej, pustej fiszki. Celem widoku jest zapewnienie intuicyjnego i responsywnego zarządzania fiszkami zgodnie z wymaganiami przedstawionymi w PRD i historyjkach użytkownika.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką:
- `/flashcards`

## 3. Struktura komponentów
- **FlashcardsPage:** Główny komponent widoku odpowiedzialny za pobieranie danych, zarządzanie stanem listy fiszek, paginację oraz obsługę modalu (zarówno do tworzenia, jak i edycji fiszek).
- **FlashcardItem:** Komponent reprezentujący pojedynczą fiszkę, wyświetlający szczegóły (przód, tył, źródło, daty) oraz przyciski do edycji i usuwania.
- **FlashcardModal:** Uniwersalny modal wykorzystywany do edycji istniejącej fiszki oraz tworzenia nowej. Modal zawiera formularz z polami „front” (max 200 znaków) i „back” (max 500 znaków) oraz przyciski: „Zapisz zmiany” i „Anuluj”.
- **SearchAndPagination:** Komponent obsługujący wyszukiwanie fiszek oraz paginację wyników.

## 4. Szczegóły komponentów

### FlashcardsPage
- Opis: Główny kontener widoku, odpowiedzialny za pobieranie danych za pomocą API GET `/api/flashcards`, zarządzanie stanem listy fiszek, otwieranie modalu edycji/tworzenia oraz obsługę akcji usunięcia.
- Główne elementy:
  - Pasek wyszukiwania.
  - Lista fiszek (mapowanie na komponent FlashcardItem).
  - Komponent paginacji.
  - Przycisk „Dodaj nową fiszkę”, który otwiera modal z pustymi polami formularza.
- Obsługiwane interakcje:
  - Inicjalne pobieranie fiszek przy pierwszym renderze.
  - Aktualizacja listy po operacjach edycji, usunięcia lub utworzenia nowej fiszki.
- Warunki walidacji: Sprawdzenie poprawności danych pobranych z API.
- Typy:
  - Wykorzystanie typu `FlashcardDTO` z pliku `src/types.ts` dla pojedynczej fiszki.
- Propsy: Zarządzanie stanem wewnętrznym – nie przyjmuje zewnętrznych właściwości.

### FlashcardItem
- Opis: Komponent prezentujący pojedynczą fiszkę wraz z akcjami.
- Główne elementy:
  - Wyświetlanie pól: `front`, `back`, `source`, `created_at`, itd.
  - Przycisk „Edytuj” otwierający modal z danymi istniejącej fiszki.
  - Przycisk „Usuń” wywołujący akcję usunięcia (DELETE `/api/flashcards/{flashcardId}`).
- Obsługiwane interakcje:
  - Kliknięcie „Edytuj” – przekazuje dane fiszki do modalu, który zostaje otwarty.
  - Kliknięcie „Usuń” – wyświetla komunikat potwierdzający przed wykonaniem żądania DELETE.
- Warunki walidacji: Walidacja odbywa się w modalu; komponent nie wykonuje walidacji danych.
- Typy:
  - `FlashcardDTO` dla danych pojedynczej fiszki.
- Propsy:
  - `flashcard: FlashcardDTO`
  - `onEdit: (flashcard: FlashcardDTO) => void`
  - `onDelete: (flashcardId: number) => void`

### FlashcardModal
- Opis: Uniwersalny modal wykorzystywany zarówno do edycji istniejącej fiszki, jak i tworzenia nowej. W trybie edycji modal jest wstępnie wypełniony danymi, natomiast w trybie tworzenia pola są puste.
- Główne elementy:
  - Formularz z dwoma inputami tekstowymi: „front” (max 200 znaków) oraz „back” (max 500 znaków).
  - Wyświetlanie komunikatów walidacyjnych przy polach formularza.
  - Przycisk „Zapisz zmiany” wysyłający żądanie PUT `/api/flashcards/{flashcardId}` (w trybie edycji) lub POST `/api/flashcards` (w trybie tworzenia).
  - Przycisk „Anuluj” zamykający modal.
- Obsługiwane interakcje:
  - Wprowadzanie danych do pól formularza z natychmiastową walidacją.
  - Kliknięcie „Zapisz zmiany” – w trybie edycji wysyłane jest żądanie aktualizacji, a w trybie tworzenia żądanie utworzenia nowej fiszki.
  - Po sukcesie modal zamyka się, a lista fiszek jest odświeżana.
- Warunki walidacji:
  - Pole „front”: wymagane, niepuste, maksymalnie 200 znaków.
  - Pole „back”: wymagane, niepuste, maksymalnie 500 znaków.
- Typy:
  - Do edycji wykorzystanie typu `FlashcardUpdateDTO` lub dedykowanego ViewModelu `FlashcardEditViewModel`.
  - Do tworzenia wykorzystanie typu `CreateFlashcardDto` (część `CreateFlashcardsCommand`) z wartością `source` ustawioną na `"manual"`.
- Propsy:
  - `flashcard?: FlashcardDTO` – opcjonalne: jeśli przekazany, modal działa w trybie edycji; w przeciwnym razie w trybie tworzenia.
  - `onSave: (data: FlashcardUpdateDTO | CreateFlashcardDto) => void`
  - `onClose: () => void`

### SearchAndPagination
- Opis: Komponent obsługujący pole wyszukiwania i kontrolki paginacji.
- Główne elementy:
  - Pole wyszukiwania umożliwiające filtrowanie fiszek.
  - Kontrolki (przyciski lub selektor) do zmiany strony wyników.
- Obsługiwane interakcje:
  - Wprowadzenie tekstu – wywołanie funkcji filtrującej w komponencie rodzica.
  - Zmiana strony – aktualizacja numeru strony oraz pobranie odpowiedniego zestawu danych.
- Warunki walidacji: Upewnienie się, że numer strony jest dodatni, a limit mieści się w określonym zakresie (max 100).
- Propsy:
  - Callbacky przekazujące zmiany filtra i numeru strony do rodzica.

## 5. Typy
- `FlashcardDTO`: zawiera pola `id`, `front`, `back`, `source`, `generation_id`, `created_at`, `updated_at`.
- `FlashcardUpdateDTO`: typ używany przy edycji, zawiera opcjonalne pola, między innymi `front`, `back`, `source`.
- `CreateFlashcardDto`: typ używany przy tworzeniu nowej fiszki; zawiera pola `front`, `back`, `source` (ustawiane na `"manual"`), opcjonalnie `generation_id`.
- `PaginationDTO`: służy do obsługi paginacji, zawiera `page`, `limit` oraz `total`.
- Nowy ViewModel (opcjonalnie): `FlashcardEditViewModel` lub `FlashcardModalViewModel`, który zawiera pola formularza oraz stan błędów walidacyjnych.

## 6. Zarządzanie stanem
- Użycie hooków `useState` oraz `useEffect` w komponencie FlashcardsPage do zarządzania:
  - Listą fiszek.
  - Stanem wyszukiwania oraz numerem bieżącej strony.
  - Widocznością modalu oraz trybem (tryb edycji vs. tworzenia).
  - Przekazywaniem danych do modalu (istniejąca fiszka lub puste pola w celu utworzenia).
- Opcjonalnie, customowy hook (np. `useFetchFlashcards`) do obsługi zapytań API i odświeżania wyników przy każdej zmianie.

## 7. Integracja API
- Pobieranie danych: GET `/api/flashcards` z obsługą parametrów (page, limit, search, sortBy, order).
- Aktualizacja fiszki: PUT `/api/flashcards/{flashcardId}` – wysyłamy zaktualizowane dane, przy walidacji ograniczeń na długość pól.
- Usuwanie fiszki: DELETE `/api/flashcards/{flashcardId}` – wywoływane po potwierdzeniu usunięcia.
- Tworzenie fiszki: POST `/api/flashcards` – wysyłamy pojedynczą fiszkę opakowaną w obiekt zgodny z `CreateFlashcardsCommand` (source ustawione na `"manual"`).

## 8. Interakcje użytkownika
- Użytkownik przegląda listę fiszek, wyszukuje i zmienia stronę wyników.
- Kliknięcie przycisku „Edytuj” przy wybranej fiszce otwiera modal z wypełnionymi danymi istniejącej fiszki.
- Kliknięcie przycisku „Dodaj nową fiszkę” otwiera modal z pustymi polami, umożliwiając utworzenie nowej fiszki.
- W modalu użytkownik wprowadza lub modyfikuje dane i klika przycisk „Zapisz zmiany”. W zależności od trybu (edycja lub tworzenie) wykonywane jest odpowiednie żądanie API (PUT lub POST).
- Po prawidłowym zapisaniu, modal zamyka się, a lista fiszek zostaje odświeżona.

## 9. Warunki i walidacja
- W modal:
  - Pole „front”: wymagane, niepuste, maksymalnie 200 znaków.
  - Pole „back”: wymagane, niepuste, maksymalnie 500 znaków.
- W komponencie paginacji: numer strony musi być dodatni, limit nie przekracza 100.
- Interfejs powinien reagować na błędy zwracane przez API, wyświetlając odpowiednie komunikaty (np. błędy walidacji w formularzu lub komunikat o błędzie sieci).

## 10. Obsługa błędów
- Wyłapywanie błędów z zapytań API w komponencie FlashcardsPage oraz FlashcardModal.
- Prezentacja komunikatów błędów (np. przez toast notifications) w przypadku problemów z walidacją lub błędów sieci.
- W przypadku błędów walidacji w modalu, komunikaty powinny być pokazywane bezpośrednio przy odpowiednich polach formularza.
- Mechanizm ponownego wysłania żądania lub informowania użytkownika o wystąpieniu problemu.

## 11. Kroki implementacji
1. Utworzyć stronę `/flashcards` i skonfigurować routing.
2. Zaimplementować komponent `FlashcardsPage` z obsługą pobierania danych (GET), zarządzania stanem wyszukiwania, paginacji oraz otwierania modalu.
3. Utworzyć komponent `FlashcardItem` do wyświetlania pojedynczych fiszek z przyciskami „Edytuj” i „Usuń”.
4. Zaimplementować uniwersalny komponent `FlashcardModal`, który obsługuje zarówno edycję istniejącej fiszki (pre-populacja danych) jak i tworzenie nowej (puste pola). Wykonać w nim walidację pól zgodnie z ograniczeniami API.
5. Utworzyć komponent `SearchAndPagination` do obsługi wyszukiwania i nawigacji między stronami wyników, przekazując zmiany do `FlashcardsPage`.
6. Zaimplementować mechanizm usuwania fiszki (DELETE) z potwierdzeniem akcji.
7. Zapewnić odświeżanie listy fiszek w `FlashcardsPage` po operacjach edycji, tworzenia lub usunięcia.
8. Przetestować wszystkie interakcje użytkownika w widoku (otwieranie modalu, zapisywanie zmian, walidację, paginację) oraz poprawność wyświetlanych komunikatów błędów.
9. Przeprowadzić code review oraz testy manualne w celu potwierdzenia zgodności z wymogami PRD oraz historyjkami użytkownika.