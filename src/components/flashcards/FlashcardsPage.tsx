import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type {
  FlashcardDTO,
  FlashcardListResponseDTO,
  GetFlashcardsParams,
  CreateFlashcardDto,
  FlashcardUpdateDTO,
  FlashcardSource,
} from "@/types";
import { FlashcardItem } from "./FlashcardItem";
import { SearchAndPagination } from "./SearchAndPagination";
import { FlashcardModal } from "./FlashcardModal";
import { Loader2 } from "lucide-react";

export function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<GetFlashcardsParams>({
    page: 1,
    limit: 10,
    sortBy: "created_at",
    order: "desc",
  });
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDTO | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchFlashcards = useCallback(async () => {
    // Anuluj poprzednie zapytanie jeśli istnieje
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Utwórz nowy kontroler dla tego zapytania
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/flashcards?${queryParams}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data: FlashcardListResponseDTO = await response.json();
      setFlashcards(data.data);
      setTotal(data.pagination.total);
      setError(null);
    } catch (err) {
      // Ignoruj błędy anulowania zapytania
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load flashcards. Please try again.");
    } finally {
      setIsLoading(false);
      // Wyczyść referencję do kontrolera
      abortControllerRef.current = null;
    }
  }, [searchParams]);

  // Efekt do czyszczenia przy odmontowaniu
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Efekt do pobierania danych
  useEffect(() => {
    fetchFlashcards();
  }, [
    searchParams.page,
    searchParams.limit,
    searchParams.sortBy,
    searchParams.order,
    searchParams.search,
    fetchFlashcards,
  ]);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearchParams((prev) => ({
      ...prev,
      page: 1,
      search: searchTerm || undefined,
    }));
  }, []);

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleCreateNew = () => {
    setSelectedFlashcard(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (flashcard: FlashcardDTO) => {
    setSelectedFlashcard(flashcard);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      toast.success("Flashcard deleted successfully");
      await fetchFlashcards();
    } catch (err) {
      toast.error("Failed to delete flashcard. Please try again.");
      console.error(err);
    }
  };

  const handleModalSubmit = async (data: { front: string; back: string }) => {
    try {
      if (selectedFlashcard) {
        // Edit existing flashcard
        const updateData: FlashcardUpdateDTO = {
          ...data,
          source: selectedFlashcard.source === "ai-full" ? "ai-edited" : (selectedFlashcard.source as FlashcardSource),
        };

        const response = await fetch(`/api/flashcards/${selectedFlashcard.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error("Failed to update flashcard");
        }

        toast.success("Flashcard updated successfully");
      } else {
        // Create new flashcard
        const createData: CreateFlashcardDto = {
          ...data,
          source: "manual" as FlashcardSource,
        };

        const response = await fetch("/api/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ flashcards: [createData] }),
        });

        if (!response.ok) {
          throw new Error("Failed to create flashcard");
        }

        toast.success("Flashcard created successfully");
      }

      await fetchFlashcards();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(
        selectedFlashcard
          ? "Failed to update flashcard. Please try again."
          : "Failed to create flashcard. Please try again."
      );
      throw err;
    }
  };

  return (
    <div className="space-y-6" data-testid="flashcards-page">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <SearchAndPagination
            total={total}
            currentPage={searchParams.page}
            pageSize={searchParams.limit}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            data-testid="search-and-pagination"
          />
        </div>
        <Button onClick={handleCreateNew} data-testid="add-flashcard-button">
          Add new flashcard
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8" data-testid="loading-spinner">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8" data-testid="error-message">
          {error}
        </div>
      ) : (
        <div className="grid gap-4" data-testid="flashcards-list">
          {flashcards.map((flashcard) => (
            <FlashcardItem
              key={flashcard.id}
              flashcard={flashcard}
              onEdit={handleEdit}
              onDelete={handleDelete}
              data-testid={`flashcard-item-${flashcard.id}`}
            />
          ))}
        </div>
      )}

      <FlashcardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        flashcard={selectedFlashcard}
        data-testid="flashcard-modal"
      />
    </div>
  );
}
