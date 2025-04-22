# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Interfejs użytkownika aplikacji 10x-cards dzieli się na kilka głównych widoków, które zapewniają spójne i intuicyjne doświadczenie. Struktura UI jest oparta na React, Tailwind CSS oraz komponentów Shadcn/ui. Całość została zaprojektowana w sposób, który umożliwia łatwą nawigację, szybki dostęp do kluczowych funkcji oraz zapewnia dostępność i bezpieczeństwo danych użytkownika. 

## 2. Lista widoków

### Widok Logowania i Rejestracji
- **Ścieżka widoku:** `/login` i `/register`
- **Główny cel:** Umożliwienie użytkownikowi autoryzacji, rejestracji.
- **Kluczowe informacje do wyświetlenia:** Formularze do wprowadzenia e-maila, hasła; komunikaty walidacyjne;
- **Kluczowe komponenty widoku:** Formularz logowania, formularz rejestracji, przyciski, komunikaty o błędach/walidacji.
- **UX, dostępność i względy bezpieczeństwa:** Zapewnienie odpowiednich komunikatów błędów, stosowanie właściwych znaczników semantycznych, ochrona danych przekazywanych przez formularz (np. przez HTTPS).

### Widok Generowania Fiszek
- **Ścieżka widoku:** `/generate`
- **Główny cel:** Umożliwia generowanie propozycji fiszek przez AI oraz ich rewizję: akceptacja, edycja, odrzucenie (endpoint `/api/generations`) 
- **Kluczowe informacje do wyświetlenia:** Pole tekstowe do wprowadzenia długiego tekstu, lista propozycji wygenerowanych fiszek przez AI, przycisk akceptacji, odrzucenia, edycji. Informacje dotyczące ograniczeń długości tekstu, komunikaty o postępie (skeleton) oraz błędach.
- **Kluczowe komponenty widoku:** Formularz z polem tekstowym, przycisk "Generuj fiszki", lista fiszek, przyciski akcji (zapisz wszystkie, zapisz zaakceptowne), wskaźnik ładowania, komunikaty o błędach.
- **UX, dostępność i względy bezpieczeństwa:** Intuicyjny formularz. Dynamiczna walidacja wejścia, czytelne komunikaty błędów, zapewnienie responsywności, ochrona przed błędnymi danymi wejściowymi.


### Widok Listy Fiszek (Zarządzania Fiszkami)
- **Ścieżka widoku:** `/flashcards`
- **Główny cel:** Umożliwienie przeglądania, edytowania i usuwania utworzonych fiszek.
- **Kluczowe informacje do wyświetlenia:** Lista fiszek z informacjami o pytaniu/odpowiedzi, o dacie utworzenia, źródle (ai-full, ai-edited, manual)
- **Kluczowe komponenty widoku:** Lista fiszek, przyciski edycji i usuwania, modal edycji
- **UX, dostępność i względy bezpieczeństwa:** Intuicyjna nawigacja w liście, dynamiczna walidacja przy edycji, komunikaty o potwierdzeniu usunięcia, bezpieczeństwo operacji (np. potwierdzenia), responsywność układu.

### Modal edycji fiszek
- **Ścieżka widoku:** Wyświetlany nad widokiem listy fiszek
- **Główny cel:** Umożliwienie edycji fiszki wraz z walidacja danych. Zapis po naciśnieciu przycisku "Zapisz zmiany"
- **Kluczowe informacje do wyświetlenia:** Formularz edycji fiszki z dwoma polami "przód" oraz "tył". Komunikaty o błędach.
- **Kluczowe komponenty widoku:** Modal z formularzem, przyciski "Zapisz zmiany", "Anuluj"
- **UX, dostępność i względy bezpieczeństwa:** Intuicyjny modal.

### Widok Panelu Użytkownika
- **Ścieżka widoku:** `/profile`
- **Główny cel:** Dostarczenie podstawowych informacji o koncie użytkownika oraz umożliwienie edycji danych konta.
- **Kluczowe informacje do wyświetlenia:** Avatar, nazwa użytkownika, e-mail, przyciski do edycji profilu oraz wylogowania.
- **Kluczowe komponenty widoku:** Karta profilu, formularz edycji, przycisk wylogowania.
- **UX, dostępność i względy bezpieczeństwa:** Ułatwienie szybkiej edycji, czytelny układ informacji, potwierdzenie operacji edycji, zabezpieczenie danych użytkownika.

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na widok logowania/rejestracji, gdzie wykonuje autoryzację.
2. Po zalogowaniu następuje przekierowanie do widoku generowania fiszek.
3. Użytkownik wprowadza tekst (spełniający wymogi długości) i wysyła żądanie wygenerowania fiszek.
4. Lista propozycji fiszek jest zwracana z API, które są prezentowane w widoku generacji.
   - W tym widoku użytkownik może zaakceptować, edytować lub odrzucić proponowane fiszki.
   - Po zakończeniu recenzji klient klika przycisk "Zapisz Zatwierdzone", co wykonuje operację bulk zapisu.
5. Po zatwierdzeniu fiszek, użytkownik może przejść do widoku zarządzania fiszkami, gdzie przegląda,edytuje lub usuwa zapisane fiszki.
6. Użytkownik ma dostęp do panelu użytkownika z informacjami o koncie oraz możliwością edycji lub wylogowania.
7. Wszystkie widoki oraz możliwość wylogowania są dostępne z poziomu Navigation Menu wyświetlanego jako Topbar aplikacji

## 4. Układ i struktura nawigacji

- **Górny pasek nawigacyjny (Topbar):** Zawiera elementy identyfikujące użytkownika (avatar, nazwa użytkownika), przycisk wylogowania oraz ewentualne skróty do głównych widoków (np. Generowanie, Moje Fiszki, Profil).
- **Routing:** Przejścia między widokami oparte na systemie routingu (np. React Router), umożliwiające bezproblemową nawigację bez przeładowania strony.
- **Dynamiczna walidacja:** Formularze we wszystkich widokach implementują dynamiczną walidację danych oraz informowanie użytkownika o błędach w sposób inline.
- **Potwierdzenia krytycznych operacji:** Mechanizm potwierdzeń (np. modal) dla operacji, które mogą skutkować utratą danych (np. bulk zapis, usunięcie fiszki).

## 5. Kluczowe komponenty

- **Formularze autoryzacyjne:** Komponenty logowania i rejestracji, które zapewniają bezpieczeństwo danych i czytelność interfejsu.
- **Flashcard Card:** Komponent do prezentacji pojedynczej fiszki, wykorzystywany zarówno w widoku generacji, jak i w zarządzaniu fiszkami.
- **Modal Edycji:** Dynamiczny modal umożliwiający edycję fiszek z walidacją limitów znaków, bez możliwości cofania zmian.
- **Lista/Tabela:** Komponent do wyświetlania listy fiszek z funkcjonalnościami
- **Wskaźniki statusu:** Komponenty do informowania o stanie operacji (loading, success, error), zapewniające lepszą komunikację z użytkownikiem.
- **Panel użytkownika:** Komponent prezentujący dane konta oraz opcje edycji profilu i wylogowania.