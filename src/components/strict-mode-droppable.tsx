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
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};
