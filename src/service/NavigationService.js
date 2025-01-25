import {createRef} from 'react';

export const navigationRef = createRef();

export const goBack = () => {
  navigationRef.current?.goBack();
};

export const navigate = ({route, params}) => {
  navigationRef.current?.navigate(route, params);
};

export const reset = ({routes, index}) => {
  console.log('navigating')
  if (index === undefined)
    index = 0
  navigationRef.current?.reset({index, routes});
};