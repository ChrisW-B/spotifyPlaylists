// react/components/Fields/Length/Styles.js
import styled from 'emotion/react';
import { FieldLabel } from '../Styles';

export const NumberInput = styled.input `
  border: none;
  font-size: 20px;
  width: 2em;
`;

export const LengthContainer = styled.div `
  display: flex;
  flex-direction: column;
  place-content: center;
  place-items: center;
`;

export const SliderInput = styled.input `
  width: 150px;
`;

export const SongLabel = styled(FieldLabel)`
  border-bottom: 2px solid var(--oc-violet-2);
`;

export { FieldWrapper, FieldLabel } from '../Styles';