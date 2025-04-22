# Plan implementacji widoku Generations

## 1. Przegląd
Widok umożliwia generowanie propozycji fiszek przy użyciu AI na podstawie wprowadzonego długiego tekstu oraz ich recenzję – akceptację, edycję i odrzucenie. Celem widoku jest ułatwienie szybkiego tworzenia fiszek przez użytkownika, przy jednoczesnym spełnieniu ograniczeń dotyczących długości tekstu i pól fiszek.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/generate`

## 3. Struktura komponentów
- **GenerationView**  Główny komponent widoku, odpowiedzialny za zarządzanie stanem, komunikację z API oraz renderowanie podkomponentów.
  - **TextAreaInput** – pole tekstowe do wprowadzania długiego tekstu (min. 1000, max. 10000 znaków).
  - **GenerateButton** – przycisk, który inicjuje wywołanie API generującego propozycje fiszek.
  - **FlashcardsList** – lista wyświetlająca wygenerowane propozycje fiszek.
    - **FlashcardItem** – pojedyncza fiszka z informacjami (przód, tył) i akcjami (akceptacja, edycja, odrzucenie).
  - **SkeletonLoader** – wskaźnik ładowania (spinner lub skeleton) wyświetlany podczas oczekiwania na odpowiedź API.
  - **ErrorMessage** – komponent do wyświetlania komunikatów błędów.
  - **BulkSaveButton** - przycisk do zapisu fiszek wszystkich lub zaakceptowanych

## 4. Szczegóły komponentów

### GenerationView
- **Opis:**  
  Główny komponent widoku, który łączy formularz wejściowy, listę propozycji fiszek oraz logikę integracji z API.
- **Główne elementy:**  
  Wrapper strony, nagłówek, sekcja formularza (TextAreaInput i GenerateButton), sekcja listy (FlashcardsList), SkeletonLoader oraz ErrorMessage.
- **Obsługiwane interakcje:**  
  - Zbieranie wartości z pola tekstowego.
  - Wywołanie API po kliknięciu przycisku "Generuj fiszki".
  - Aktualizacja listy fiszek na podstawie odpowiedzi API.
  - Przekazywanie akcji akceptacji, edycji i odrzucenia z poziomu FlashcardItem.
- **Warunki walidacji:**  
  - Tekst wejściowy musi mieć od 1000 do 10000 znaków.
- **Typy:**  
  - Użycie typów `GenerateFlashcardsCommand` oraz `CreateGenerationResponseDTO`.
- **Propsy:**  
  Brak, komponent działa jako samodzielna strona.

### TextAreaInput
- **Opis:**  
  Komponent odpowiadający za pole tekstowe, w którym użytkownik wprowadza tekst do wygenerowania fiszek.
- **Główne elementy:**  
  - HTML `<textarea>` z etykietą.
- **Obsługiwane zdarzenia:**  
  - `onChange` – aktualizacja stanu wartości pola.
- **Warunki walidacji:**  
  - Dynamiczna sprawdzanie liczby znaków (min. 1000, max. 10000).
- **Typy:**  
  - Propsy: `value: string`, `onChange: (value: string) => void`.

### GenerateButton
- **Opis:**  
  Przycisk inicjujący proces generacji fiszek.
- **Główne elementy:**  
  - HTML `<button>`.
- **Obsługiwane zdarzenia:**  
  - `onClick` – wywołanie API.
- **Warunki walidacji:**  
  - Przycisk zostaje wyłączony (disabled) podczas wysyłania żądania.
- **Typy:**  
  - Propsy: `onClick: () => void`, `disabled: boolean`.

  ### GenerateButton
- **Opis:**  
  Przycisk umożliwiający zbiorczy zapis wszystkich fiszek
- **Główne elementy:**  
  - Dwa przyciski HTML `<button>` "Zapisz wszystkie", "Zapisz zaakceptowane"
- **Obsługiwane zdarzenia:**  
  - `onClick` – wywołanie API.
- **Warunki walidacji:**  
  - Przycisk zostaje wyłączony (disabled) podczas wysyłania żądania oraz gry nie istnieją fiszki do zapisu
- **Typy:**  
  - Propsy: onSaveAll, onSaveAccepted, disabled

### FlashcardsList
- **Opis:**  
  Komponent renderujący listę wygenerowanych propozycji fiszek.
- **Główne elementy:**  
  - Lista (np. `<ul>`) mapująca tablicę propozycji na komponenty FlashcardItem.
- **Obsługiwane zdarzenia:**  
  - Przekazywanie zdarzeń z komponentu FlashcardItem do rodzica (GenerationView).
- **Warunki walidacji:**  
  - Lista może być pusta lub zawierać fiszki zgodne z typem `FlashcardProposalViewModel`.
- **Typy:**  
  - Propsy: `proposals: FlashcardProposalViewModel[]`, akcje (np. onAccept, onEdit, onReject).

### FlashcardItem
- **Opis:**  
  Reprezentacja pojedynczej propozycji fiszki, umożliwiająca wykonanie akcji na niej.
- **Główne elementy:**  
  - Wyświetlenie pól: `front` i `back`.
  - Trzy przyciski do akcji: akceptuj, edytuj, odrzuć.
- **Obsługiwane zdarzenia:**  
  - `onAccept` – akceptacja fiszki.
  - `onEdit` – edycja fiszki (otwarcie interfejsu edycji/modala).
  - `onReject` – odrzucenie fiszki.
- **Warunki walidacji:**  
  - Podczas edycji walidacja: `front` max 200 znaków, `back` max 500 znaków.
- **Typy:**  
  - Propsy: `proposal: FlashcardProposalViewModel`, `onAccept: () => void`, `onEdit: (edited: { front: string; back: string, accepted: boolean, edited: boolean}) => void`, `onReject: () => void`.

### SkeletonLoader
- **Opis:**  
  Komponent wizualizujący stan ładowania.
- **Główne elementy:**  
  - Spinner lub skeleton loader.
- **Obsługiwane zdarzenia:**  
  - Brak.
- **Typy:**  
  - Propsy: brak (statyczny komponent).

### ErrorMessage
- **Opis:**  
  Komponent wyświetlający komunikat błędu.
- **Główne elementy:**  
  - Element zawierający tekst komunikatu, np. `<div>` lub `<p>`.
- **Obsługiwane zdarzenia:**  
  - Brak.
- **Typy:**  
  - Propsy: `message: string`.

## 5. Typy
- **GenerateFlashcardsCommand:**  
  `{ source_text: string }`
- **CreateGenerationResponseDTO:**  
  `{ generation_id: number, generated_count: number, flashcards_proposals: FlashCardProposalDTO[] }`
- **FlashCardProposalDTO:**  
  `{ front: string, back: string, source: "ai-full" }`
- (Opcjonalnie) **ViewModelFlashcard:**  
  Model zawierający dodatkowe pola, np. `id`, `status` (np. 'pending', 'accepted', 'rejected') do zarządzania stanem interfejsu.
- **FlashcardProposalViewModel** {front: string, back: string, source: "ai-full" | "ai-edited", accepted: boolean, edited: boolean} - rozszerzony model reprezentujący stan propozycji fiszki, umożliwiający dynamiczne ustawienie pola source podczas wysyłania danych do endpointu `/flashcards`

## 6. Zarządzanie stanem
- **Główne zmienne stanu (w GenerationView):**
  - `textInput: string` – wartość pola tekstowego.
  - `proposals: FlashCardProposalDTO[]` lub ewentualnie niestandardowy model widoku.
  - `isLoading: boolean` – wskaźnik wyświetlania SkeletonLoader.
  - `error: string | null` – komunikat błędu.
- **Niestandardowe hooki:**  
  Rozważenie stworzenia customowego hooka `useGenerations`, który ujednolici logikę wywołań API, w tym wysyłanie żądania do endpointu POST `/api/generations` oraz obsługę odpowiedzi i błędów.

## 7. Integracja API
- **Wywołanie API do generacji fiszek:**
  - Endpoint: `POST /api/generations`
  - Żądanie: `{ source_text: string }` (walidacja: 1000–10000 znaków).
  - Odpowiedź: obiekt typu `CreateGenerationResponseDTO` zawierający `generation_id`, `generated_count` oraz tablicę `flashcards_proposals`.
- **Wywołanie API do zapisu fiszek:**
  - Endpoint: `POST /api/flashcards`
  - Żądanie: `{ flashcards: Array<{ front: string, back: string, source: string, generation_id?: number }> }`
- **Sposób wywołania:**  
  Użycie `fetch` (lub biblioteki axios) w niestandardowym hooku lub bezpośrednio w komponencie GenerationView, wraz z obsługą stanów ładowania, sukcesu i błędów.

## 8. Interakcje użytkownika
- Użytkownik wpisuje tekst w polu TextAreaInput.
- Po kliknięciu GenerateButton następuje:
  - Walidacja długości tekstu.
  - Wywołanie API generującego fiszki.
  - W czasie oczekiwania wyświetlany jest SkeletonLoader.
- Po otrzymaniu odpowiedzi użytkownik widzi listę propozycji w FlashcardsList.
- Użytkownik może na poszczególnych fiszkach:
  - Kliknąć „akceptuj”, aby oznaczyć fiszkę do zapisania.
  - Kliknąć „edytuj”, aby zmodyfikować zawartość fiszki (z walidacją długości: front ≤200, back ≤500).
  - Kliknąć „odrzuć”, aby usunąć fiszkę z listy propozycji.
- Po dokonaniu wyboru możliwy jest zapis zaakceptowanych fiszek poprzez wywołanie `/api/flashcards` poprzez BulkSaveButton.
- W razie błędu (np. nieprawidłowe dane, błąd serwera) wyświetlany jest komunikat przez ErrorMessage.

## 9. Warunki i walidacja
- **Walidacja wejścia:**  
  - Tekst musi mieć co najmniej 1000 i maksymalnie 10000 znaków, dynamicznie sprawdzany w komponencie TextAreaInput.
- **Walidacja pól fiszki:**  
  - Podczas edycji sprawdzenie: front ≤200 znaków, back ≤500 znaków.
- **Walidacja API:**  
  - Odpowiedzi API w przypadku przekroczenia limitów lub błędów wywołują odpowiedni komunikat błędu.
- **Interfejs:**  
  - Przycisk GenerateButton jest disabled podczas wysyłania żądania.
  - Na poziomie formularza zapewniona jest walidacja przed wysłaniem żądania.

## 10. Obsługa błędów
- Wyświetlenie komunikatu błędu przy:
  - Niepoprawnej długości wprowadzonego tekstu.
  - Błędach zwróconych przez API (np. błąd 400, 500).
- Logowanie błędów do konsoli.
- Umożliwienie ponowienia akcji przez użytkownika poprzez ponowne kliknięcie przycisku generacji lub akcji na fiszkach.

## 11. Kroki implementacji
1. Utworzenie routingu `/generate` oraz nowej strony GenerationView.
2. Implementacja głównego komponentu GenerationView:
   - Inicjalizacja stanu: textInput, proposals, isLoading, error.
   - Podpięcie logiki wywołania API do endpointu POST `/api/generations`.
3. Stworzenie komponentu TextAreaInput z dynamiczną walidacją długości tekstu.
4. Stworzenie komponentu GenerateButton obsługującego kliknięcie oraz stan loading.
5. Implementacja komponentu FlashcardsList wraz z komponentem FlashcardItem:
   - Wyświetlenie propozycji,
   - Obsługa akcji (akceptacja, edycja z walidacją, odrzucenie).
6. Utworzenie komponentów SkeletonLoader i ErrorMessage do komunikacji ze stanem ładowania i błędami.
7. Implementacja komponentu BulkSaveButton do zbiorczego wysyłania żądania do endpointu POST /flashcards
8. (Opcjonalnie) Stworzenie niestandardowego hooka `useGenerations` dla obsługi API i zarządzania błędami.
9. Integracja z endpointami API (`/api/generations` oraz `/api/flashcards`) wraz z odpowiednią obsługą żądań, stanów ładowania i błędów.
10. Testowanie widoku pod kątem poprawności walidacji, interakcji użytkownika oraz responsywności.
11. Finalny przegląd i refaktoryzacja kodu pod kątem czytelności i zgodności ze stylem projektu.