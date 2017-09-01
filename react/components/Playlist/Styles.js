import styled from 'styled-components';

export const PlaylistWrapper = styled.div `
  border: 1px solid black;
  &:first-child {
    border-radius: 5px 5px 0 0;
    & > span {
      border-radius: 5px 5px 0 0;
      & > a:last-child {
        border-radius: 0 5px 0 0;
      }
    }
  }
  &:last-child {
    border-top: 0;
    & > span {
      border-radius: 0 0 5px 5px;
      & > a:last-child {
        border-radius: 0 0 5px;
      }
    }
  }
`;

export const PlaylistInfo = styled.span `
  background-color: ${({on}) => on ? 'var(--oc-green-2)' : 'var(--oc-red-2)'};
  display: flex;
  place-items: stretch;
`;

export const PlaylistTitle = styled.p `
  flex: 1 1 auto;
  padding: 5px;
`;

export const Button = styled.a `
  background: ${({settings, on}) => settings ? 'var(--oc-blue-0)' :'transparent'};
  border-left: ${({settings})=> settings ? '1px solid var(--oc-blue-5)' : '0' };
  color: ${({settings, on}) => settings ? 'var(--oc-blue-4)' : on ? 'var(--oc-green-7)' : 'var(--oc-red-7)'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  place-content: center;
  place-items: center;

  svg {
    font-size: 30px;
  }
`;

export const Toggle = styled.span `
  display: flex;
  flex-direction: column;
  place-content: center;
  place-items: center;
`;