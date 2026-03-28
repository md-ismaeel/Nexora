import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

/** Typed dispatch — use instead of plain useDispatch() */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed selector — use instead of plain useSelector() */
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);
