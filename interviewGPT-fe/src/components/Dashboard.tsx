import React, { useContext, useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import api from "./customAxios/Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faChevronDown,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../context/JobContext";
import { deleteJob } from "../context/JobContext";

interface DataItem {
  id: number;
  jd: string;
  role: string;
  active: string;
}

const Dashboard = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const { dispatch } = useContext(UserContext)!;
  const [editableRow, setEditableRow] = useState<number | null>(null);
  const navigate = useNavigate();
  const [fullDescription, setFullDescription] = useState<boolean>(false);
  const [fullDescriptionId, setFullDescriptionId] = useState<number | null>(
    null
  );
  const itemsPerPage = 10;
  const currentPage = 1;

  useEffect(() => {
    const getJobList = async () => {
      try {
        const response = await api.get("/export_jobs_json");
        setData(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getJobList();
  }, []);

  // useEffect(() => {
  //   setData(state.job_list);
  // }, [state.job_list]);

  const deleteJobHandler = async (item: DataItem) => {
    try {
      const resp = await api.post("/delete_job", {
        role: item.role,
        id: item.id,
      });
      if (resp.status === 200) {
        dispatch(deleteJob(item.id));
        setData(data.filter((job) => job.id !== item.id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
  ------------------- Edit Job  -------------------
  */

  const toggleEditRow = (id: number) => {
    if (editableRow === id) {
      setEditableRow(null);
    } else {
      setEditableRow(id);
    }
  };

  const saveEditedRow = async (item: any) => {
    let active: boolean;
    if (item.active === "true") {
      active = true;
    } else active = false;
    try {
      const response = await api.put(`/edit_job/${item.id}`, {
        role: item.role,
        jd: item.jd,
        active: active,
      });
      console.log(response);
    } catch (error: unknown) {
      console.log(error);
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

  const handleRoleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const newData = data.map((item) => {
      if (item.id === id) {
        return { ...item, role: event.target.value };
      }
      return item;
    });
    setData(newData);
  };

  // const handleJdChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   id: number
  // ) => {
  //   const newData = data.map((item) => {
  //     if (item.id === id) {
  //       return { ...item, jd: event.target.value };
  //     }
  //     return item;
  //   });
  //   setData(newData);
  // };

  const statusChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    id: number
  ) => {
    const newData: DataItem[] = data.map((item: DataItem) => {
      if (item.id === id) {
        console.log(item);
        return {
          ...item,
          active: event.target.value === "true" ? "true" : "false",
        };
      }
      return item;
    });
    console.log(newData);
    setData(newData);
  };

  const toggleDescription = (id: number) => {
    setFullDescriptionId(id);
    setFullDescription((prevState) =>
      prevState && fullDescriptionId === id ? false : true
    );
  };

  /**
   * Pagination
   */

  // const totalPages = Math.ceil(data.length / itemsPerPage);

  // const handlePageClick = (selectedPage: number) => {
  //   setCurrentPage(selectedPage);
  // };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div
      className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
      style={{ backgroundColor: "#fff" }}
    >
      <p className="sm:w-[93%] w-full mx-auto">
        <Header />
      </p>
      <div
        className="max-w-[1400px] min-w-fit mx-auto mt-[-2rem] sm:p-6 p-2"
        style={{ paddingTop: 0 }}
      >
        <div className="mb-4">
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        </div>
        <div className="flex justify-end items-center mb-4">
          <div className="flex gap-[2rem]">
            <div
              className="flex w-[19rem] items-center bg-zinc-200 dark:bg-zinc-800 rounded-lg "
              style={{ padding: "0 0 0 5px" }}
            >
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent focus:outline-none dark:text-white flex-1"
              />
              <button className="bg-blue-500 text-white p-2 rounded-lg ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-5-5m2-2a8 8 0 10-16 0 8 8 0 0016 0z"
                  />
                </svg>
              </button>
            </div>
            <button
              className="bg-blue-500 text-white p-2 rounded-lg shadow"
              onClick={() => navigate("/app")}
            >
              Add new JD
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-700 rounded-lg shadow overflow-hidden">
          {data.length > 0 && (
            <table className="w-full overflow-auto min-w-fit">
              <thead className="bg-zinc-200 dark:bg-zinc-600">
                <tr>
                  <th className="p-3 text-left" style={{ width: "300px" }}>
                    Job Title
                  </th>
                  <th className="p-3 text-left" style={{ width: "500px" }}>
                    Job Description
                  </th>
                  <th className="p-3 text-left w-[250px]">Active</th>
                  <th className="p-3 text-left w-[250px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item: DataItem) => (
                  <tr className="border-b dark:border-zinc-600" key={item.id}>
                    <td
                      className="p-3 font-bold underline cursor-pointer"
                      onClick={() => handleRowClick(item.id)}
                    >
                      {editableRow === item.id ? (
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => handleRoleChange(e, item.id)}
                        />
                      ) : (
                        <>
                          {item.role}
                          <FontAwesomeIcon
                            icon={faArrowUpRightFromSquare}
                            className=" ml-1 w-3 h-3"
                          />
                        </>
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
                      {(fullDescription && fullDescriptionId == item.id) ||
                      item.jd.length <= 100 ? (
                        <p className="">
                          {item.jd}{" "}
                          {fullDescription && fullDescriptionId == item.id && (
                            <FontAwesomeIcon
                              icon={faChevronUp}
                              className="ml-1"
                              onClick={() => toggleDescription(item.id)}
                            />
                          )}
                        </p>
                      ) : (
                        <p className="">
                          {item.jd.slice(0, 100)}...
                          <span onClick={() => toggleDescription(item.id)}>
                            {fullDescription && fullDescriptionId == item.id ? (
                              <FontAwesomeIcon
                                icon={faChevronUp}
                                className="ml-1"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                className="ml-1"
                              />
                            )}
                          </span>
                        </p>
                      )}
                    </td>
                    {/* <td className="p-3">
                            <span className="bg-green-200 text-green-700 py-1 px-3 rounded-full text-xs">
                              Active
                            </span>
                          </td> */}
                    <td className="p-3">
                      {editableRow === item.id ? (
                        <select
                          className="bg-green-200 text-green-700 py-1 px-3 rounded-full text-xs"
                          onChange={(e) => statusChange(e, item.id)}
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      ) : (
                        <span
                          className={`${
                            item.active
                              ? "bg-green-200 text-green-700"
                              : "bg-red-600 text-black"
                          }  py-1 px-3 rounded-full text-xs`}
                        >
                          {item.active === "true" ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-500 dark:text-zinc-400 relative">
                      {editableRow === item.id ? (
                        <div className="flex items-center justify-around text-lg">
                          <div>
                            <button
                              onClick={() => saveEditedRow(item)}
                              className="cursor-pointer resp-btn "
                              style={{ color: "green" }}
                              title="Save"
                            >
                              Save
                            </button>
                          </div>
                          <div>
                            <button
                              onClick={() => cancelEditRow()}
                              className="cursor-pointer resp-btn "
                              style={{ color: "red" }}
                              title="Save"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-around text-lg">
                          <div>
                            <button
                              onClick={() => toggleEditRow(item.id)}
                              className="cursor-pointer resp-btn "
                              style={{ color: "green" }}
                              title="Edit"
                            >
                              Edit
                            </button>
                          </div>
                          <div>
                            <button
                              onClick={() => deleteJobHandler(item)}
                              className="cursor-pointer resp-btn "
                              style={{ color: "red" }}
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
