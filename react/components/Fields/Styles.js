import styled from 'styled-components';

export const FieldWrapper = styled.li `
  display: flex;
  justify-content: space-between;
  list-style: none;
  padding: 20px 5px;
`;

export const TextInput = styled.input `
  border: 0;
  border-bottom: 2px solid var(--oc-violet-4);
  font-size: 18px;
  text-align: right;
  width: 250px;

  &:invalid {
    border: 0;
    border-bottom: 2px solid var(--oc-red-4);
    box-shadow: none;
  }
`;

export const SliderInput = styled.input `
  width: 250px;
`

export const RadioLabel = styled.label `
  background: ${props => props.checked ? 'var(--oc-violet-9)' : 'white'};
  border: 1px solid var(--oc-violet-9);
  border-left: 0;
  color: ${props => props.checked ? 'white' : 'var(--oc-violet-9)'};
  cursor: pointer;
  padding: 5px;
  &:first-child {
    border: 1px solid var(--oc-violet-9);
    border-radius: 5px 0 0 5px;
  }
  &:last-child {
    border-radius: 0 5px 5px 0;
  }
`;

export const Radio = styled.input `
  display: none;
`;

export const NumberInput = styled.input `
  border: none;
  border-bottom: 2px solid var(--oc-violet-4);
  font-size: 20px;
  width: 2em;
`