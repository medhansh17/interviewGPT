

const ReportTable = ({ softSkillPercentage, numericValues, data }: any) => {
    console.log("nummervalues", numericValues)
    return (
        <div className="border border-gray-300 shadow-sm rounded-lg overflow-hidden max-w-sm mx-auto mt-16 mb-[1rem]">
            <table className="w-full text-sm leading-5">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-4 text-left font-medium text-gray-600">Skills</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-600">Report %</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-3 px-4 text-left font-medium text-gray-600">Soft Skill</td>
                        <td className="py-3 px-4 text-left">{softSkillPercentage}%</td>
                    </tr>

                    {
                        Object.keys(data)?.map((itm, index) => {
                            return <tr className="bg-gray-50" key={index}>
                                <td className="py-3 px-4 text-left font-medium text-gray-600">
                                    {itm}
                                </td>
                                <td className="py-3 px-4 text-left">{data[itm]}</td>
                            </tr>
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default ReportTable