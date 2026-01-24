import { useCallback } from "react";

export function useBillingNavigation({
  items,
  displayItems,
  itemRefs,
  handleAddItem,
  handleRemoveItem,
}) {

  const getDisplayIndex = useCallback(
    (id) => displayItems.findIndex(i => i.id === id),
    [displayItems]
  );

  const findNextUserRow = useCallback(
    (startIdx) => {
      for (let i = startIdx + 1; i < displayItems.length; i++) {
        if (!displayItems[i].isFree) return displayItems[i];
      }
      return null;
    },
    [displayItems]
  );

  const findPrevUserRow = useCallback(
    (startIdx) => {
      for (let i = startIdx - 1; i >= 0; i--) {
        if (!displayItems[i].isFree) return displayItems[i];
      }
      return null;
    },
    [displayItems]
  );

  const handleKeyDown = useCallback(
    (e, item, field) => {
      const idx = getDisplayIndex(item.id);

      /* ================= ENTER ================= */
      if (e.key === "Enter") {
        e.preventDefault();

        if (field === "name") {
          itemRefs.current[`qty-${item.id}`]?.focus();
          return;
        }

        if (field === "qty") {
          itemRefs.current[`price-${item.id}`]?.focus();
          return;
        }

        if (field === "price") {
          const nextUser = findNextUserRow(idx);

          if (nextUser) {
            itemRefs.current[`name-${nextUser.id}`]?.focus();
          } else {
            handleAddItem();
          }
        }
      }

      /* ================= BACKSPACE ================= */
      if (e.key === "Backspace" && e.target.value === "") {
        if (items.length <= 1) return;

        if (field === "price") {
          e.preventDefault();
          itemRefs.current[`qty-${item.id}`]?.focus();
          return;
        }

        if (field === "qty") {
          e.preventDefault();
          itemRefs.current[`name-${item.id}`]?.focus();
          return;
        }

        if (field === "name") {
          e.preventDefault();

          const prevUser = findPrevUserRow(idx);
          if (!prevUser) return;

          const isEmptyRow =
            !item.name &&
            (!item.qty || item.qty === 1) &&
            !item.price;

          if (isEmptyRow) {
            handleRemoveItem(item.id);
          }

          setTimeout(() => {
            itemRefs.current[`price-${prevUser.id}`]?.focus();
          }, 40);
        }
      }
    },
    [
      items.length,
      displayItems,
      itemRefs,
      handleAddItem,
      handleRemoveItem,
      findNextUserRow,
      findPrevUserRow,
      getDisplayIndex,
    ]
  );

  return { handleKeyDown };
}
