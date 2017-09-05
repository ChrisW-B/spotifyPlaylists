import styled from 'styled-components';

export const FieldLabel = styled.label `
  border-bottom: 2px solid var(--oc-violet-4);
  font-size: 18px;
  padding-bottom: 1.5px;
`;

export const SongLabel = styled(FieldLabel)`
  border-bottom: 2px solid var(--oc-violet-2);
`

export const FieldWrapper = styled.li `
  display: flex;
  justify-content: space-between;
  list-style: none;
  padding: 20px 5px;
  place-items: center;
`;

export const TextInput = styled.input `
  border: 0;
  border-bottom: 2px solid var(--oc-violet-2);
  font-size: 18px;
  text-align: right;
  width: 250px;

  &:invalid {
    border: 0;
    border-bottom: 2px solid var(--oc-red-4);
    box-shadow: none;
  }
`;

export const RadioLabel = styled.label `
  background: ${props => props.checked ? 'var(--oc-violet-9)' : 'white'};
  border: 1px solid var(--oc-violet-9);
  border-left: 0;
  color: ${props => props.checked ? 'white' : 'var(--oc-violet-9)'};
  cursor: pointer;
  padding: 10px 5px;

  @media (min-width: 600px) {
    &:first-child {
      border: 1px solid var(--oc-violet-9);
      border-radius: 5px 0 0 5px;
    }
    &:last-child {
      border-radius: 0 5px 5px 0;
    }
  }

  @media (max-width: 600px) {
    border: 1px solid var(--oc-violet-9);
    display: block;
    &:not(:first-child) {
      border-top: 0;
    }
    &:first-child {
      border-radius: 5px 5px 0 0;
    }
    &:last-child {
      border-radius: 0 0 5px 5px;
    }
  }
`;

export const Radio = styled.input `
  display: none;
`;

export const LengthContainer = styled.div `
  display: flex;
  flex-direction: column;
  place-content: center;
  place-items: center;
`;

export const NumberInput = styled.input `
  border: none;
  border-bottom: 2px solid var(--oc-violet-2);
  font-size: 20px;
  width: 2em;
`

export const SliderInput = styled.input `
  width: 200px;
`