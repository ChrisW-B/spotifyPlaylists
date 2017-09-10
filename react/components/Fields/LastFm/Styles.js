// react/components/Fields/LastFm/Styles.js
import styled from 'emotion/react';

export const TextInput = styled.input `
  border: 0;
  border-bottom: 2px solid var(--oc-violet-2);
  font-size: 18px;
  text-align: right;
  width: 150px;

  &:invalid {
    border: 0;
    border-bottom: 2px solid var(--oc-red-4);
    box-shadow: none;
  }
`;

export { FieldLabel, FieldWrapper } from '../Styles';