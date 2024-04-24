import React from 'react'


interface SideProps {
    questions:any;
    setCurrentIndex: React.Dispatch<React.SetStateAction<any>>;
   currentIndex:number
  }

 

const SideBar: React.FC<SideProps> = ({questions,setCurrentIndex,currentIndex }: any) => {

  return (
    <div className="w-64 bg-zinc-100 p-3">
        <div className='pb-3 text-center border-b-2 border-zinc-400 py-[2rem] pb-[1.1rem]'>Problems</div>
            <ul className='mt-3'>
              {questions.map((item:any,index:number)=>{
                return (
                    <li className="mb-2" key={item.id} onClick={()=>setCurrentIndex(index)}>
                    <button className={currentIndex==index?`flex  items-center w-full p-2 bg-blue-500 text-white rounded-lg`:"w-full text-left p-2 bg-zinc-200 hover:bg-zinc-300 rounded"}>
                      <span className="mr-2">{index+1}.</span> Question {index+1}
                    </button>
                  </li>
                )
              })}
           
              
            </ul>
          </div>
        
       
  )
}

export default SideBar