import { createSlice } from "@reduxjs/toolkit"

const selectedCaseSlice = createSlice({
    name: "selectedCase",
    initialState: {
        selectedCase: {}
    },
    reducers:{
      selectCase: (state, action) => {
        //console.log(action.payload)
        state.selectedCase = action.payload
      },
      resetCase: (state)=>  {
        state.selectedCase = {}
      }
    }
  })
  
  export const { selectCase, resetCase } = selectedCaseSlice.actions;
  export default selectedCaseSlice.reducer