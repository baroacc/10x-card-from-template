# Specyfikacja modułu autoryzacji i uwierzytelniania

Niniejszy dokument opisuje architekturę i rozwiązania dotyczące rejestracji, logowania, wylogowywania oraz odzyskiwania hasła użytkowników w aplikacji 10x-cards. Specyfikacja została przygotowana na podstawie wymagań z PRD (szczególnie US-001, US-002) oraz dokumentacji stosu technologicznego (tech-stack).

---

## 1. Architektura interfejsu użytkownika

### 1.1 Przegląd zmian w warstwie frontendu
- **Nowe strony**:
  - `/register` – Strona rejestracji nowego użytkownika.
  - `/login` – Strona logowania użytkownika.
  - `/forgot-password` – Strona służąca do inicjowania procesu odzyskiwania hasła.
- **Trasy chronione**:
  - Strony, które wymagają autoryzacji (np. `/generate`, `/flashcard`), muszą sprawdzać status sesji użytkownika (pobierany za pomocą Supabase Auth) i w przypadku braku autentykacji przekierowywać na `/login`.
- **Modyfikacje Layoutu**:
  - Wspólny layout (np. `/layouts/Layout.astro`) należy rozszerzyć o zmiany w nagłówku/menu:
    - **Użytkownicy zalogowani**: Wyświetlanie szczegółów profilu, przycisku wylogowania oraz ewentualnie linku do ustawień konta.
    - **Użytkownicy niezalogowani**: Wyświetlanie linków do logowania i rejestracji.

### 1.2 Komponenty React (Client-Side)
- **Komponent RegistrationForm**:
  - Pola: Email, hasło, potwierdzenie hasła.
  - Walidacje:
    - Sprawdzenie poprawności formatu adresu email.
    - Weryfikacja siły hasła.
    - Pole potwierdzenia musi pasować do hasła.
  - Obsługa błędów: Wyświetlanie komunikatów o niepoprawnym adresie email, słabym haśle lub niezgodności haseł.
  - Integracja: Po zatwierdzeniu formularza wywołanie metody `auth.signUp` z SDK Supabase Auth.

- **Komponent LoginForm**:
  - Pola: Email, hasło.
  - Walidacje:
    - Wszystkie pola są wymagane.
    - Obsługa błędów przy logowaniu (np. niepoprawne dane logowania).
  - Integracja: Użycie metody `auth.signIn` z SDK Supabase. W przypadku sukcesu – przekierowanie użytkownika do strony głównej lub chronionej strony docelowej.

- **Komponent ForgotPasswordForm**:
  - Pole: Email.
  - Walidacje:
    - Sprawdzenie poprawności formatu adresu email.
  - Integracja: Użycie funkcjonalności odzyskiwania hasła w Supabase (np. `auth.api.resetPasswordForEmail` lub alternatywnej metody) do wysłania emaila resetującego.
  - Obsługa błędów: Informowanie użytkownika, jeśli podany email nie istnieje lub wystąpił inny błąd API.

- **Integracja komponentów React z Astro**:
  - Strony Astro będą osadzać odpowiednie komponenty React z dyrektywą `client:load`.
  - Podział odpowiedzialności:
    - Strony Astro odpowiadają za routing, layout i wstępne sprawdzenie sesji.
    - Komponenty React skupiają się na parsowaniu danych wejściowych, walidacji formularzy i komunikacji z backendem przy użyciu SDK Supabase.

### 1.3 Walidacja i obsługa błędów
- **Błędy walidacji**:
  - Wyświetlanie komunikatów inline przy formularzach.
- **Błędy API**:
  - Globalny alert informujący o problemach (np. błąd rejestracji, logowania) występujących podczas komunikacji z backendem.
- **Powiadomienia o sukcesie**:
  - Po udanej rejestracji – automatyczne zalogowanie użytkownika i przekierowanie, lub informacja o potrzeby weryfikacji konta.
  - W przypadku odzyskiwania hasła – komunikat o wysłaniu emaila z instrukcjami resetu.

### 1.4 Kluczowe scenariusze użytkownika
- **Scenariusz rejestracji**:
  1. Użytkownik przechodzi na stronę `/register`.
  2. Wypełnia formularz (email, hasło, potwierdzenie hasła).
  3. Wykonywana jest walidacja po stronie klienta.
  4. Po zatwierdzeniu, komponent wywołuje metodę `auth.signUp` z Supabase.
  5. W przypadku sukcesu, użytkownik jest automatycznie logowany i przekierowywany lub inicjowany jest odpowiedni proces weryfikacji.
  6. Wszelkie błędy są przekazywane i wyświetlane inline.

- **Scenariusz logowania**:
  1. Użytkownik przechodzi na stronę `/login`.
  2. Wprowadza adres email oraz hasło.
  3. Wykonywana jest walidacja po stronie klienta.
  4. Po zatwierdzeniu formularza, wywoływana jest metoda `auth.signIn` z Supabase.
  5. W przypadku sukcesu, sesja użytkownika jest utrzymywana, a użytkownik jest przekierowywany do strony chronionej.
  6. W przypadku nieprawidłowych danych, użytkownik otrzymuje stosowny komunikat błędu.

- **Scenariusz odzyskiwania hasła**:
  1. Użytkownik przechodzi na stronę `/forgot-password`.
  2. Wprowadza zarejestrowany adres email.
  3. Komponent wywołuje metodę resetującą hasło przy użyciu API Supabase.
  4. Użytkownik otrzymuje informację, że email resetujący został wysłany.

---

## 2. Logika backendowa

### 2.1 Struktura Endpointów API oraz Modele Danych
- **Integracja z Supabase Auth**:
  - Wykorzystanie wbudowanych endpointów Supabase do zarządzania autoryzacją. Brak konieczności tworzenia dedykowanych endpointów, chyba że wymagana będzie dodatkowa logika.
  - Tabela użytkowników w Supabase przechowuje dane takie jak email, UID, hasło (w formie zaszyfrowanej) oraz metadane.
- **Dodatkowe Endpointy (opcjonalnie)**:
  - Jeśli wymagana jest dodatkowa logika (np. dodatkowa walidacja czy logowanie zdarzeń), można utworzyć funkcje serverless lub endpointy pod adresem `/api/auth/`.
    - Przykład: `POST /api/auth/register` – otaczający logiką Supabase `auth.signUp` z dodatkowymi walidacjami lub logowaniem.
    - Przykład: `POST /api/auth/login` – obsługujący logikę walidacji i logowania.
  - Modele danych powinny zapewniać:
    - Email: prawidłowy format, unikalność.
    - Hasło: wymagania dotyczące długości i złożoności.

### 2.2 Walidacja Danych oraz Obsługa Wyjątków
- **Walidacja danych wejściowych**:
  - Każdy endpoint (lub biblioteka kliencka) powinien walidować:
    - Format email.
    - Siłę hasła oraz zgodność pola potwierdzenia (w przypadku rejestracji).
- **Obsługa wyjątków**:
  - Obsługa błędów generowanych przez Supabase (np. duplikat adresu email podczas rejestracji, błędne dane logowania).
  - Logowanie błędów dla celów monitorowania, jednocześnie wyświetlanie przyjaznych komunikatów dla użytkownika.

### 2.3 Relacja z istniejącymi stronami
- **Routing i zarządzanie sesją**:
  - Strona główna (`/index.astro`) przekierowuje do `/generate`, która jest stroną chronioną – przed renderowaniem następuje weryfikacja sesji użytkownika przy użyciu Supabase Auth.
  - Strona `/flashcard` również wykonuje weryfikację sesji.
  - Użytkownik niezalogowany próbujący uzyskać dostęp do stron chronionych zostanie przekierowany na `/login`.

---

## 3. System uwierzytelniania

### 3.1 Integracja z Supabase Auth
- Wykorzystanie SDK Supabase Auth dla zapewnienia funkcjonalności:
  - **Rejestracja**: Metoda `auth.signUp` do tworzenia nowych kont użytkowników.
  - **Logowanie**: Metoda `auth.signIn` do weryfikacji danych logowania.
  - **Wylogowywanie**: Metoda `auth.signOut` do kończenia sesji użytkownika.
  - **Odzyskiwanie hasła**: Metoda resetująca hasło (np. `auth.api.resetPasswordForEmail`) do inicjowania procesu odzyskiwania hasła.

### 3.2 Integracja z Astro
- **Zarządzanie sesją**:
  - Strony Astro dokonują sprawdzenia ważności sesji użytkownika (przy użyciu klienta Supabase lub po stronie serwera) przed renderowaniem treści chronionych.
  - W przypadku braku ważnej sesji następuje przekierowanie użytkownika do strony logowania.
- **Obsługa zmian stanu autoryzacji**:
  - Komponenty React nasłuchują zmian stanu autoryzacji poprzez subskrypcję na zdarzenia Supabase (np. logowanie, wylogowanie) i aktualizują interfejs w czasie rzeczywistym.

### 3.3 Kontrakty między modułami
- **Komponenty frontendowe**:
  - Powinny wykorzystywać jednolite interfejsy Supabase Auth, co zapewnia spójność w obsłudze rejestracji, logowania i odzyskiwania hasła.
- **Warstwa API/Backend**:
  - W przypadku użycia niestandardowych endpointów, kontrakty request-response powinny być zgodne ze schematami JSON, na wzór funkcji oferowanych przez Supabase Auth.
- **Wspólne moduły i serwisy**:
  - Utworzenie wspólnego modułu (np. `/services/supabaseClient.ts`) służącego do inicjalizacji i eksportowania klienta Supabase. Dzięki temu zapewniona jest spójność konfiguracji w całej aplikacji (zarówno na stronach Astro, jak i w komponentach React).

---

## Podsumowanie
Specyfikacja została opracowana z myślą o modularności, bezpieczeństwie i spójności z istniejącą architekturą aplikacji 10x-cards. Walidacja, obsługa błędów i zarządzanie sesją użytkownika mają być realizowane w ramach mechanizmów oferowanych przez Supabase Auth. Integracja stron Astro oraz komponentów React zapewni płynne doświadczenie użytkownika przy minimalnej ingerencji zarówno w istniejący interfejs, jak i backend.
