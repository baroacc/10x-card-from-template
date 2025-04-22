<conversation_summary>
<decisions>
Główny przepływ użytkownika: logowanie → przejście do widoku generowania fiszek → wpisanie tekstu → przegląd i recenzja propozycji (poprzez akceptację, edycję lub odrzucenie) → wykonanie operacji bulk "Zapisz Zatwierdzone" z potwierdzeniem.
Lista fiszek ma wyświetlać datę utworzenia oraz źródło (np. ai-full, ai-edited, manual).
Modal do edycji fiszki ma posiadać dynamiczną walidację limitów znaków, bez możliwości cofania zmian.
Informacje zwrotne (feedback) będą przekazywane w formie podstawowych inline wiadomości.
Operacja bulk zapisu wymaga potwierdzenia użytkownika, aby uniknąć przypadkowych zapisów.
Topbar nawigacyjny nie musi być rozwijany – wystarczy prosty układ z avatar'em, nazwą użytkownika i przyciskiem wylogowania.
Panel użytkownika wyświetla proste informacje o koncie z możliwością edycji.
Responsywność aplikacji zostanie zapewniona przez utility variants od Tailwind (np. sm:, md:, lg:).
</decisions>
<matched_recommendations>
Użycie oddzielnych widoków (rejestracja, logowanie, generowanie fiszek, lista fiszek z edycją, panel użytkownika)
Implementacja topbara nawigacyjnego z podstawowymi danymi użytkownika korzystając z Shadcn/ui.
Stosowanie inline feedbacku do informowania użytkownika o statusach akcji (loading, error, success).
Wykorzystanie React Context oraz hooków do zarządzania stanem aplikacji.
Implementacja dynamicznej walidacji formularzy w modalach edycji (np. z React Hook Form).
Projektowanie interfejsu zgodnie z podejściem mobile-first, wykorzystując responsywność Tailwind CSS.
Potwierdzanie operacji bulk zapisu, aby zapobiec przypadkowym zatwierdzeniom.
Integracja JWT dla autoryzacji i bezpieczeństwa.
</matched_recommendations>
<ui_architecture_planning_summary>
Projekt architektury UI dla MVP obejmuje następujące kluczowe elementy:
Główne widoki: ekran logowania, rejestracji, widok generowania fiszek, widok listy fiszek (z możliwością edycji w modalach oraz przyciskami usuwania) oraz panel użytkownika z informacjami o koncie.
Przepływ użytkownika: Po logowaniu użytkownik trafia do widoku generowania fiszek, gdzie wpisuje tekst, otrzymuje propozycje fiszek, recenzuje je (akceptacja, edycja, odrzucenie) i dokonuje bulk zapisu zatwierdzonych fiszek z potwierdzeniem.
Integracja z API: Interfejs komunikuje się z endpointami API (/api/generations, /api/flashcards) do generowania fiszek oraz ich zapisu. Dane będą wizualizowane w prostych listach i formularzach.
Zarządzanie stanem: Wykorzystanie React Context i hooków do synchronizacji stanu pomiędzy widokami, ułatwiając refetching danych i zarządzanie stanami ładowania oraz błędów.
Responsywność, dostępność i bezpieczeństwo: UI będzie projektowane zgodnie z podejściem mobile-first przy użyciu utility variants od Tailwind (sm:, md:, lg:), a autoryzacja zostanie zaimplementowana z wykorzystaniem JWT. Interfejs będzie prosty, spójny i dostępny, korzystając z komponentów Shadcn/ui.
</ui_architecture_planning_summary>
<unresolved_issues>
Brak nierozwiązanych kwestii – wszystkie zagadnienia zostały omówione i ustalone.
</unresolved_issues>
</conversation_summary>