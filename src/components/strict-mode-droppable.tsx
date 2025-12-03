"use client";

import React, { useEffect, useState } from "react";
import {
  Droppable,
  DroppableProps,
  DroppableProvided,
  DroppableStateSnapshot,
} from "@hello-pangea/dnd";

export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(animation);
  }, []);

  if (!enabled) {
    // Render a "mock" droppable during the first mount so the tree structure is consistent
    const provided = {
      innerRef: () => {},
      droppableProps: {},
      placeholder: null,
    } as unknown as DroppableProvided;

    const snapshot = {
      isDraggingOver: false,
    } as DroppableStateSnapshot;

    if (typeof children === "function") {
      // @hello-pangea/dnd uses render-props pattern
      return <>{(children as any)(provided, snapshot)}</>;
    }

    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};
