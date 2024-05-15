import React, {
  createContext,
  useReducer,
  useEffect,
  ReactNode,
  Dispatch,
} from "react";

// Define types for your state
interface UserState {
  job_list: any[];
  candidate_list: any[];
  isFetching: boolean;
  error: boolean;
}

// Define your initial state
const INITIAL_STATE: UserState = {
  job_list: [],
  candidate_list: [],
  isFetching: false,
  error: false,
};
interface DataItem {
  id: number;
  jd: string;
  role: string;
}

interface CandItem {
  JD_MATCH: number;

  MATCH_STATUS: string;

  Matching_Skills: string[];

  Missing_Skills: string[];
  candidate_name: string;
  resume_filename: string;
}

// Define the action types and the action interface if needed
// For example:
type UserAction =
  | { type: "SET_JOB_LIST"; payload: DataItem[] }
  | { type: "DELETE_JOB"; payload: number }
  | { type: "SET_CAND_LIST"; payload: CandItem[] }
  | { type: "ADD_CANDIDATE"; payload: CandItem }
  | { type: "DELETE_CANDIDATE"; payload: string };

export const setJobList = (data: DataItem[]): UserAction => ({
  type: "SET_JOB_LIST",
  payload: data,
});

export const deleteJob = (id: number): UserAction => ({
  type: "DELETE_JOB",
  payload: id,
});

export const setCandList = (data: CandItem[]): UserAction => ({
  type: "SET_CAND_LIST",
  payload: data,
});

export const addCandidate = (candidate: CandItem): UserAction => ({
  type: "ADD_CANDIDATE",
  payload: candidate,
});

export const deleteCandidateByName = (name: string): UserAction => ({
  type: "DELETE_CANDIDATE",
  payload: name,
});

// Define your reducer function
const UserReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case "SET_JOB_LIST":
      return { ...state, job_list: action.payload };
    case "DELETE_JOB":
      return {
        ...state,
        job_list: state.job_list.filter((job) => job.id !== action.payload),
      };
    case "SET_CAND_LIST":
      return { ...state, candidate_list: action.payload };
    case "ADD_CANDIDATE":
      return {
        ...state,
        candidate_list: [...state.candidate_list, action.payload],
      };
    case "DELETE_CANDIDATE":
      return {
        ...state,
        candidate_list: state.candidate_list.filter(
          (candidate) => candidate.candidate_name !== action.payload
        ),
      };
    // case 'SET_IS_FETCHING':
    //   return { ...state, isFetching: action.payload };
    // case 'SET_ERROR':
    //   return { ...state, error: action.payload };
    default:
      return state;
  }
};

interface UserContextType {
  state: UserState;
  dispatch: Dispatch<any>;
}
// Create your context
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
interface UserContextProviderProps {
  children: ReactNode;
}

// Create your context provider
//   export const UserContextProvider: React.FC<UserContextProviderProps>({ children }) => {
//   const [state, dispatch] = useReducer(UserReducer, INITIAL_STATE);

//   // Example of a useEffect hook
//   useEffect(() => {
//     localStorage.setItem('list', JSON.stringify(state.job_list));
//   }, [state.job_list]);

//   return (
//     <UserContext.Provider
//       value={{
//         state,
//         dispatch,
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// };
export const UserContextProvider: React.FC<UserContextProviderProps> = ({
  children,
}: UserContextProviderProps) => {
  const [state, dispatch] = useReducer(UserReducer, INITIAL_STATE);

  // Example of a useEffect hook
  useEffect(() => {
    localStorage.setItem("list", JSON.stringify(state.job_list));
  }, [state.job_list]);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};
