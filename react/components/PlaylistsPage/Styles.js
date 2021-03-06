import styled from 'react-emotion';

export const ListWrapper = styled.div `
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  overflow: scroll;
  padding: 0 20px;
  place-content: center;
  place-items: center;
`;

export const List = styled.ul `
  display: flex;
  flex-direction: column;
  max-width: 900px;
  padding: 0;
  width: 100%;
  & > li {
    list-style: none;

    &:first-child {
      border-radius: 5px 5px 0 0;

      & a:last-child {
        border-top-right-radius: 5px;
      }
    }

    &:last-child {
      border-radius: 0 0 5px 5px;

      & a:last-child {
        border-bottom-right-radius: 5px;
      }
    }
  }
`;
