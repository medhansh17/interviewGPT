import React from 'react'
import './online.css';

interface QuestionProps {
    questions:any;
    currentIndex:number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<any>>;
  
  }
const Code: React.FC<QuestionProps> = ({questions,currentIndex,setCurrentIndex }: any) => {
    const {id,question}=questions[currentIndex];
    const previousbtn=()=>{
        if(currentIndex==0){
          setCurrentIndex(questions.length-1)
        }else setCurrentIndex(currentIndex-1)
      }
      const nextbtn=()=>{
        if(currentIndex==questions.length-1){
          setCurrentIndex(0)
        }else setCurrentIndex(currentIndex+1)
      }
    
  return (
    <div className="flex-1">
            <div className="bg-zinc-200 p-4">
              <div className="flex justify-between items-center mb-3 py-3 border-b-2 border-zinc-400">
                <h1 className="text-lg font-semibold ">Question {currentIndex+1}</h1>
                <div>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md mr-2" onClick={nextbtn}>NEXT</button>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md">SUBMIT</button>
                </div>
                
              </div>
              <div className='mb-3'>
                    {question}
                </div>
              {/* <textarea className="w-full h-96 p-2 bg-white border border-zinc-300 rounded-lg" >
              
        </textarea> */}
        <pre contentEditable="true" spellCheck="false" >
<span>Enter Your Code</span>
</pre>
            </div>
          </div>

          
  )
}

export default Code