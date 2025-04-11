# PRD (10x-cards)
## 1. Przegląd produktu
Projekt "10x-cards" ma na celu usprawnienie procesu tworzenia wysokiej jakości fiszek edukacyjnych. Aplikacja oferuje dwa główne tryby tworzenia fiszek:
- Generowanie fiszek przy użyciu sztucznej inteligencji na podstawie wprowadzonego tekstu (kopiuj-wklej).
- Manualne tworzenie fiszek przy użyciu prostego formularza.
  
Dodatkowo, system umożliwia:
- Przeglądanie, edycję i usuwanie fiszek.
- Przechowywanie fiszek w ramach konta użytkownika
- Integrację z gotowym, open-source’owym algorytmem powtórek w celu umożliwienia nauki metodą spaced repetition.

## 2. Problem użytkownika
Główny problem, który ma rozwiązać nasza aplikacja, dotyczy czasochłonności i trudności związanych z ręcznym tworzeniem fiszek edukacyjnych. Użytkownicy chcą korzystać z efektywnej metody nauki, jaką jest spaced repetition, ale bariera czasowa związana z przygotowywaniem treści uniemożliwia im regularne stosowanie tej metody.

## 3. Wymagania funkcjonalne
1. Generowanie fiszek przez AI:
   - Użytkownik wprowadza tekst o długości od 1000 do 10000 znaków.
   - AI przetwarza tekst i generuje wiele kandydatów na fiszki.
   - Proces recenzji – użytkownik dokonuje wyboru: zaakceptuj, edytuj lub odrzuć fiszki.
   - Zapis do bazy danych tylko fiszek zaakceptowanych przez użytkownika.

2. Manualne tworzenie fiszek:
   - Formularz umożliwiający ręczne tworzenie fiszek za pomocą pól formularza "przód" (do 200 znaków) oraz "tył" (do 500 znaków).

3. Zarządzanie fiszkami:
   - Przeglądanie listy fiszek w ramach widoku "Moje fiszki" z funkcjami wyszukiwania, paginacji oraz edycji (np. poprzez modal).
   - Możliwość edycji i usuwania istniejących fiszek.

4. System kont użytkowników:
   - Rejestracja i logowanie.
   - Zastosowanie zasad bezpieczeństwa, autentykacji, autoryzacji
   - Możliwość usunięcia konta i powiązanych z nim fiszek 

5. Integracja z algorytmem powtórek:
   - Wykorzystanie open-source’owego algorytmu w celu zarządzania procesem spaced repetition

6. Statystyki
   - Zbieranie informacji odnośnie liczby fiszek wygenerowanych przez AI i ile z nich zostało zatwierdzonych

## 4. Granice produktu
W ramach MVP nie zostaną wdrożone następujące funkcjonalności:
- Własny, zaawansowany algorytm powtórek (analogiczny do SuperMemo, Anki).
- Import danych z różnych formatów (PDF, DOCX, itp.).
- Współdzielenie zestawów fiszek między użytkownikami.
- Integracje z zewnętrznymi platformami edukacyjnymi.
- Aplikacje mobilne – na początku tylko wersja web.

## 5. Historyjki użytkowników

### US-001
- ID: US-001
- Tytuł: Rejestracja konta
- Opis: Jako potencjalny użytkownik chcę móc się zarejestrować, aby móc bezpiecznie korzystać z aplikacji oraz generować i przechowywać swoje fiszki.
- Kryteria akceptacji:
  - Użytkownik może dokonać rejestracji poprzez unikalny adres e-mail oraz hasło.
  - System stosuje walidację danych
  - Użytkownik otrzymuje potwierdzenie rejestracji oraz zostaje zalogowany

### US-002
- ID: US-002
- Tytuł: Logowanie do systemu
- Opis: Jako zarejestrowany użytkownik chcę mieć możliwość zalogowania do aplikacji aby móc korzystać z aplikacji oraz generować i przechowywać swoje fiszki.
- Kryteria akceptacji:
  - Po podaniu prawidłowych danych (e-mail oraz hasło) użytkownik zostaje przekierowany do strony głównej aplikacji
  - Błąd logowania powoduje wyświetlenie informacji o nieprawidłowych danych


### US-003
- ID: US-003
- Tytuł: Generowanie fiszek przy użyciu AI
- Opis: Jako zarejestrowany użytkownik chcę wprowadzić tekst (od 1000 do 10000 znaków), aby AI mogła wygenerować kandydatury fiszek, co przyspieszy proces tworzenia zestawu fiszek.
- Kryteria akceptacji:
  - Pole tekstowe przyjmuje od 1000 do 10000 znaków.
  - AI generuje fiszki zawierające pola "przód" i "tył" zgodnie z limitami znaków (200 znaków dla przodu, 500 dla tyłu).
  - Wygenerowane fiszki przechodzą przez proces recenzji przez użytkownika.

### US-004
- ID: US-004
- Tytuł: Ręczne tworzenie fiszek
- Opis: Jako zalogowany użytkownik chcę mieć możliwość ręcznego tworzenia fiszek za pomocą prostego formularza, aby móc wprowadzić własne treści edukacyjne.
- Kryteria akceptacji:
  - Formularz umożliwia wprowadzenie pola "przód" (do 200 znaków) oraz "tył" (do 500 znaków).
  - Po zatwierdzeniu, fiszka zostaje zapisana w bazie danych użytkownika.
  - Formularz jest intuicyjny i szybki w obsłudze.

### US-005
- ID: US-005
- Tytuł: Recenzja wygenerowanych fiszek przez AI
- Opis: Jako zalogowany użytkownik chcę móc recenzować fiszki wygenerowane przez AI, aby móc zaakceptować, edytować lub odrzucić każdą z nich, a następnie zapisywać tylko zatwierdzone fiszki.
- Kryteria akceptacji:
  - System prezentuje wygenerowane fiszki w formie listy umożliwiającej recenzję.
  - Użytkownik ma opcje: zaakceptuj, edytuj lub odrzuć każdą fiszkę.
  - Po wyborze opcji, system umożliwia zapis w trybie bulk (zapis tylko fiszek zaakceptowanych).
  - Edycja umożliwia modyfikację obu pól fiszki („przód” i „tył”) zgodnie z limitami znaków.

### US-006
- ID: US-006
- Tytuł: Zarządzanie fiszkami
- Opis: Jako zalogowany użytkownik chcę mieć możliwość przeglądania, wyszukiwania, edytowania oraz usuwania moich fiszek, aby móc łatwo zarządzać swoimi materiałami edukacyjnymi.
- Kryteria akceptacji:
  - Użytkownik widzi listę wszystkich swoich fiszek.
  - Interfejs umożliwia wyszukiwanie fiszek po tytule lub zawartości.
  - Użytkownik może wprowadzać edycje w modalach lub bezpośrednio na liście.
  - Użytkownik może usunąć fiszkę z potwierdzeniem akcji.

### US-007
- ID: US-007
- Tytuł: Nauka z algorytmem powtórek
- Opis: Jako zalogowany użytkownik chcę aby zapisane fiszki były dostępne w sesjach powtórek, które będą wykorzystywać zewnętrzną bibliotekę.
- Kryteria akceptacji:
  - W widoku "Sesja nauki" algorytm przygotowuje dla mnie sesję nauki fiszek
  - Na start wyświetlany jest przód fiszki, poprzez interakcje wyświetlany jest jej tył
  - Użytkownik ocenia na ile przyswoił fiszkę, a następnie system pokazuje kolejną

## 6. Metryki sukcesu
1. Akceptacja fiszek generowanych przez AI:
   - Minimum 75% fiszek wygenerowanych przez AI powinno zostać zaakceptowanych przez użytkownika.
2. Wykorzystanie funkcji generowania przez AI:
   - Co najmniej 75% wszystkich fizycznie utworzonych fiszek w systemie powinno pochodzić z funkcji generowania przez AI.
3. Zaangażowanie
   - Monitorowanie liczby wygenerowanych fiszek i porównanie z liczbą zatwierdzonych do analizy jakości i użyteczność