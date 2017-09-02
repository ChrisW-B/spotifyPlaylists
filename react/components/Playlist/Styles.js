import styled from 'styled-components';

export const PlaylistWrapper = styled.div`
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
    border-radius: 0 0 5px 5px;
    border-top: 0;
    & > span {
      & > a:last-child {
        border-radius: 0 0 5px;
      }
    }
  }
`;

export const PlaylistInfo = styled.span`
  background-color: ${({on}) => on ? 'var(--oc-green-2)' : 'var(--oc-red-2)'};
  display: flex;
  place-items: stretch;
`;

export const PlaylistTitle = styled.p`
  flex: 1 1 auto;
  padding: 5px;
`;

export const Button = styled.a`
  background: ${({settings, on}) => settings ? 'var(--oc-blue-0)' : 'transparent'};
  border-left: ${({settings}) => settings ? '1px solid var(--oc-blue-5)' : '0'};
  color: ${({settings, on}) => settings ? 'var(--oc-blue-4)' : on ? 'var(--oc-green-7)' : 'var(--oc-red-7)'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-width: 45px;
  padding: 0 10px;
  place-content: center;
  place-items: center;
  position: relative;
  width: 50px;

  svg {
    font-size: 28px;
    padding: 4px;
  }

  &:hover > span {
    opacity: 1;
  }
`;

export const ButtonDescription = styled.span`
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  padding: 5px;
  position: absolute;
  text-align: center;
  top: -2px;
  transition: opacity 0.33s;
  width: 60px;
`;

export const Toggle = styled.span`
  display: flex;
  flex-direction: column;
  place-content: center;
  place-items: center;
`;