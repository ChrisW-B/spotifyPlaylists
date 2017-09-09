import styled from 'emotion/react';

const FieldWrapper = styled.li `
  display: flex;
  justify-content: space-between;
  list-style: none;
  padding: 20px 5px;
  place-items: center;
`;

const FieldLabel = styled.label `
  border-bottom: 2px solid var(--oc-violet-4);
  font-size: 18px;
  padding-bottom: 1.5px;
`;

export { styled, FieldLabel, FieldWrapper }