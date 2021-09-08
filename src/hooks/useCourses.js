const useCourses = async () => {
    let columns = [
        { field: 'col1', headerName: 'Turma', width: 150 }, 
        { field: 'col2', headerName: 'Horário', width: 125 },
        { field: 'col3', headerName: 'Professor', width: 170 },
    ]
    let rows = []
    try {
        const schoolClasses = (await (classesRef.once('value'))).val()
        
        let coursesData = []
  
        for (const classKey in schoolClasses) {
          if (Object.hasOwnProperty.call(schoolClasses, classKey)) {
            const classInfo = schoolClasses[classKey];
            rows.push({ id: classKey, col1: classKey, col2: classInfo.hora + 'h', col3: classInfo.professor[0].nome})
            coursesData.push({turmaAluno: classKey, horaAluno: classInfo.hora + 'h', profAluno: classInfo.professor[0]})
          }
        }
        sessionStorage.setItem('coursesData', JSON.stringify(coursesData))
  
    } catch (error) {
        setErrorMessage(error.message)
    }

    return { rows, columns };
}
 
export default useCourses;