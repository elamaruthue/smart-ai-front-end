import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/** Typed dispatch hook – use everywhere instead of plain useDispatch */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed selector hook – use everywhere instead of plain useSelector */
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector);
