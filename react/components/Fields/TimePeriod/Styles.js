// import { FieldWrapper, Radio, RadioLabel, FieldLabel } from './Styles';
// react/components/Fields/TimePeriod/Styles.js
import styled from 'react-emotion';

export const RadioLabel = styled.label `
  background: ${({checked}) => checked ? 'var(--oc-violet-9)' : 'white'};
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

export { FieldWrapper, FieldLabel } from '../Styles';
