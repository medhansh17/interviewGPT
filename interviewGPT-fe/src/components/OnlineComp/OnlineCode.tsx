import React, { useState } from 'react'
import SideBar from './SideBar';
import Code from './Code';

const OnlineCode = () => {
  const [currentIndex,setCurrentIndex]=useState(0);

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
  

  const questions=[
    {id:1,question:"What is blah blah1 nbgctxawsgom t eswa    nbgctxawsgom t eswa            u  yf xw fgyffswwrtrpmbcfedggyrrewd nbgctxawsgom t eswa            u  yf xw fgyffswwrtrpmbcfedggyrrewd nbgctxawsgom t eswa            u  yf xw fgyffswwrtrpmbcfedggyrrewd         u  yf xw fgyffswwrtrpmbcfedggyrrewd"},
    {id:2,question:"What is blah blah2"},
    {id:3,question:"What is blah blah3"},
    {id:4,question:"What is blah blah4"},
  ]
  // const {id,question}=questions[currentIndex]
  return (
    <div className="flex h-screen">
          <SideBar questions={questions} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}/>
          <Code questions={questions} setCurrentIndex={setCurrentIndex} currentIndex={currentIndex} />
        </div>
        

  )
}

export default OnlineCode;


