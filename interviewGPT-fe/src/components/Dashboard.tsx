
       

        import React, { useContext, useEffect, useState } from 'react';
        import Header from './Header';
        import { useNavigate } from 'react-router-dom';
        import api from './customAxios/Axios';
        import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
        import { faTrash, faEdit, faSave, faTimes ,faChevronUp,faChevronDown} from '@fortawesome/free-solid-svg-icons';
        import { UserContext } from '../context/JobContext';
        import { setJobList, deleteJob } from '../context/JobContext';
        

        interface DataItem {
          id: number;
          jd: string;
          role: string;
        }
        
        const Dashboard = () => {
          const { state, dispatch } = useContext(UserContext)!;
          const [data, setData] = useState<DataItem[]>([]);
          const [editableRow, setEditableRow] = useState<number | null>(null);
          const navigate = useNavigate();
          const [fullDescription, setFullDescription] = useState<boolean>(false);
          const [fullDescriptionId, setFullDescriptionId] = useState<number | null>(null);
          const [itemsPerPage, setItemsPerPage] = useState(10);
const [currentPage, setCurrentPage] = useState(1);
          useEffect(() => {
            const getJobList = async () => {
              try {
                const response = await api.get("/export_jobs_json");
                dispatch(setJobList(response.data));
              } catch (error) {
                console.log(error);
              }
            };
            getJobList();
          }, [dispatch]);
        
          useEffect(() => {
            setData(state.job_list);
          }, [state.job_list]);
        
          const deleteJobHandler = async (item: DataItem) => {
            try {
              const resp = await api.post("/delete_job", { role: item.role, id: item.id });
              console.log(resp);
              dispatch(deleteJob(item.id));
            } catch (error) {
              console.log(error);
            }
          };
        
          const toggleEditRow = (id: number) => {
            if (editableRow === id) {
              setEditableRow(null);
            } else {
              setEditableRow(id);
            }
          };
        
          const saveEditedRow = async(item:any) => {
            try{
const response = await api.put(`/edit_job/${item.id}`,{role:item.role,jd:item.jd});
console.log(response)
            }catch(error:unknown){
              console.log(error)
            }
            setEditableRow(null);
          };
        
          const cancelEditRow = () => {
            setEditableRow(null);
          };
        
          const handleRowClick = (id: number) => {
            if (!editableRow) {
              navigate(`/respective-dashboard/${id}`);
            }
          };
        
          const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
            const newData = data.map(item => {
              if (item.id === id) {
                return { ...item, role: event.target.value };
              }
              return item;
            });
            setData(newData);
          };
        
          const handleJdChange = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
            const newData = data.map(item => {
              if (item.id === id) {
                return { ...item, jd: event.target.value };
              }
              return item;
            });
            setData(newData);
          };
        
          const toggleDescription = (id: number) => {
            setFullDescriptionId(id);
            setFullDescription((prevState) => prevState && fullDescriptionId === id ? false : true);
          };

          const totalPages = Math.ceil(data.length / itemsPerPage);

          const handlePageClick = (selectedPage: number) => {
            setCurrentPage(selectedPage);
          };
          

          const indexOfLastItem = currentPage * itemsPerPage;
          const indexOfFirstItem = indexOfLastItem - itemsPerPage;
          const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

          return (
            <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" style={{ backgroundColor: "#fff" }}>
              <p className='w-[93%] mx-auto'><Header /></p>
              <div className="container mx-auto mt-[-2rem] p-6" style={{ paddingTop: 0 }}>
                <div className="mb-4">
                  <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
                  
                </div>
                <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
            <button className="bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 p-2 rounded-lg shadow">
              Delete
            </button>
            <button className="bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 p-2 rounded-lg shadow">
              Filters
            </button>
            
          </div >
          <div className='flex gap-[2rem]'>
          <div className="flex w-[19rem] items-center bg-zinc-200 dark:bg-zinc-800 rounded-lg " style={{padding:"0 0 0 5px"}}>
            <input type="text" placeholder="Search..." className="bg-transparent focus:outline-none dark:text-white flex-1"/>
            <button className="bg-blue-500 text-white p-2 rounded-lg ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5-5m2-2a8 8 0 10-16 0 8 8 0 0016 0z" />
                </svg>
            </button>
        </div>
          <button className="bg-blue-500 text-white p-2 rounded-lg shadow" onClick={()=>navigate("/app")} >Add new JD</button>
        </div>
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-lg shadow overflow-hidden">
                  {data.length > 0 && <table className="w-full">
                    <thead className="bg-zinc-200 dark:bg-zinc-600">
                      <tr>
                        <th className="p-3 text-left" style={{width:"300px"}}>Job Title</th>
                        <th className="p-3 text-left" style={{width:"500px"}}>Job Description</th>
                        <th className="p-3 text-left w-[250px]">Active</th>
                        <th className="p-3 text-left w-[250px]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item: DataItem) => (
                        <tr className="border-b dark:border-zinc-600" key={item.id}>
                          <td className="p-3 font-bold underline cursor-pointer" onClick={() => handleRowClick(item.id)}>
                            {editableRow === item.id ? (
                              <input type="text" value={item.role} onChange={(e) => handleRoleChange(e, item.id)} />
                            ) : (
                              item.role
                            )}
                          </td>
                          {/* <td className="p-3">
                            {editableRow === item.id ? (
                              <input type="text" value={item.jd} onChange={(e) => handleJdChange(e, item.id)} />
                            ) : (
                              <p className='desc'>{item.jd}</p>
                            )}
                          </td> */}

<td className="p-3">
                    {(fullDescription && fullDescriptionId==item.id) || item.jd.length <= 100 ? (
                      <p className="">{item.jd} {fullDescription && fullDescriptionId==item.id && <FontAwesomeIcon icon={faChevronUp} className="ml-1" onClick={()=>toggleDescription(item.id)} /> }</p>
                    ) : (
                      <p className="">{item.jd.slice(0, 100)}...
                      <span onClick={()=>toggleDescription(item.id)}>{(fullDescription && fullDescriptionId==item.id) ? <FontAwesomeIcon icon={faChevronUp} className="ml-1" /> : <FontAwesomeIcon icon={faChevronDown} className="ml-1" />}</span>
                      </p>
                    )}
                    
                  </td>
                          <td className="p-3">
                            <span className="bg-green-200 text-green-700 py-1 px-3 rounded-full text-xs">
                              Active
                            </span>
                          </td>
                          <td className="p-3 text-zinc-500 dark:text-zinc-400 relative">
                            {editableRow === item.id ? (
                              <div className='flex items-center justify-around text-lg'>
                                <div><FontAwesomeIcon icon={faSave} onClick={() => saveEditedRow(item)} className="mr-2 cursor-pointer " title='Save' style={{ color: "green" }} /></div>
                                <div><FontAwesomeIcon icon={faTimes} onClick={() => cancelEditRow()} className="cursor-pointer " title='Cancel' /></div>
                              </div>
                            ) : (
                              <div className='flex items-center justify-around text-lg'>
                                <div><FontAwesomeIcon icon={faEdit} onClick={() => toggleEditRow(item.id)} className="mr-2 cursor-pointer " title='Edit' style={{ color: "blue" }}/></div>
                                <div><FontAwesomeIcon icon={faTrash} onClick={() => deleteJobHandler(item)} className="cursor-pointer " title='Delete' style={{ color: "red" }} /></div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
                </div>
                {/* <div className="flex justify-center mt-4">
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l focus:outline-none disabled:opacity-50"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => handlePageClick(index + 1)}
          className={`mx-1 px-3 py-2 rounded focus:outline-none ${
            currentPage === index + 1
              ? "bg-blue-700 text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          {index + 1}
        </button>
      ))}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none disabled:opacity-50"
      >
        Next
      </button>
    </div> */}
              </div>
            </div>
          );
        };
        
        export default Dashboard;