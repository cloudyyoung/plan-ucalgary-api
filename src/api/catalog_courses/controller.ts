import { Request, Response } from "express"
import { CatalogCourse } from "../../models/"
import { jwtDecode } from "jwt-decode"
import JwtContent from "../../models/interfaces.gen"
import { Account } from "../../models/account"
import { course, courseData, RequisiteList } from "../../models/interfaces.gen"
import { CatalogProgram } from "../../models/catalog_program"
import JsonLogic from "../../jsonLogic/jsonLogic"

export const Courses = async (req: Request, res: Response) => {
  try {
    const allCourses = await CatalogCourse.find({}).limit(30)
    return res.status(200).json({ message: allCourses })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error: "Something went wrong." })
  }
}

export const checkPrereq = async (token: string, course_id: string) => {
  //const { token, course_id } = req.body
  const decoded = jwtDecode<JwtContent>(token)
  const account_id = decoded.payload.user.id
  if (!token || !course_id) {
    return { error: "Missing attributes." }
  }

  const checkAccount = await Account.findById({ _id: account_id })
  if (!checkAccount) {
    return { error: "Account does not exist." }
  }

  const checkCourse = await CatalogCourse.findOne({ coursedog_id: course_id })
  if (!checkCourse) {
    return { error: "Course does not exist." }
  }

  /*
  if (
    (checkCourse.prereq == null && checkCourse.antireq == null) ||
    (Object.keys(checkCourse.prereq).length && Object.keys(checkCourse.antireq).length)
  ) {
    return res.status(400).json({ status: true })
  }*/
  //checkCourse.?requisites

  const courseIds: string[] = checkAccount.courses.map((x) => x.id)
  console.log(courseIds)
  const courseList: courseData[] = await CatalogCourse.find({ coursedog_id: { $in: courseIds } })
    .select("subject_code course_number credits faculty_code departments -_id")
    .lean()

  const courseListFinal: course[] = courseList.map((x: courseData) => ({
    code: x.subject_code,
    number: x.course_number,
    unit: x.credits,
    faculty: x.faculty_code,
    departments: x.departments,
  }))
  console.log(courseList)

  const programIds = checkAccount.programs
  const ProgramList = await CatalogProgram.find({ _id: { $in: programIds } })
    .select("code -_id")
    .lean()

  const prereqList = checkCourse
    .filter((x: RequisiteList) => x.type == "Prerequisite")
    .map((x: RequisiteList) => x.rules)
  const antiReqList = checkCourse.requisites
    .filter((x: RequisiteList) => x.type == "Antirequisite")
    .map((x: RequisiteList) => x.rules)
    .map()

  /* Add json logic function part here */

  return { course: courseListFinal, program: ProgramList }
}
// open main.py under bianco,
// Run the script. It will create course anti/pre/co-req.
// Process the prereq json logic

/*
 * prereq: The pre-req json logic structure
 * courseList: The list of courses the user took
 * programList: The list of programs that the user is in
 */
/*
const processPrereq = (prereq, courseList, programList) => {
  let checkList: unknown[] = []
  const checkResults: boolean[] = []
  // Loop through each key in the object
  if ("and" in prereq) {
    checkList = prereq["and"]
  } else if ("or" in prereq) {
    checkList = prereq["or"]
  } else {
    checkList = [prereq]
  }

  for (const item of checkList) {
    //{'course': 'ENSF300'}
    if ("course" in item) {
      const course = item["course"]
      //console.log(courseList.includes(course))
      if (courseList.includes(course)) {
        checkResults.push(true)
      } else {
        checkResults.push(false)
      }

      // {"units": {"required": 3, "from": [{"course": "GEOG211"}, {"course": "GEOG308"}, {"course": "GEOG310"}]}}
    } else if ("units" in item && "from" in item.units && Array.isArray(item.units.from)) {
      // Initialize an empty list to store the courses
      const courses: string[] = []

      // Access the 'from' array
      const fromArray = item.units.from

      // Loop through the 'from' array and extract the 'course' values
      fromArray.forEach((item) => {
        if (item.course) {
          courses.push(item.course)
        }
      })

      // Access the 'required' attribute
      const required = parseInt(item.units.required) / 3

      // Check how many of these courses the user completed
      let completed = 0
      for (const c in courses) {
        if (courseList.includes(courses[c])) {
          completed += 1
        }
      }
      console.log(completed)
      // If completed more than or equals then we pass
      if (completed >= required) {
        checkResults.push(true)
      } else {
        checkResults.push(false)
      }
      // {"units": {"required": 15, "from": {"subject_code": "ART"}}}
    } else if ("units" in item && "from" in item.units && item.units.from != null) {
      const required = parseInt(item.units.required) / 3
      const subjectCode = item.units.from.subject_code
      const takenList = courseList.filter((x) => x.startsWith(subjectCode))

      if (takenList.length >= required) {
        checkResults.push(true)
      } else {
        checkResults.push(false)
      }
      // {"units": {"required": 54}}
    } else if ("units" in item && item.units.from == null) {
      console.log("SAAA")
      const required = parseInt(item.units.required) / 3
      if (courseList.length >= required) {
        checkResults.push(true)
      } else {
        checkResults.push(false)
      }
    }
    // {"admission": "Honours in Visual Studies"}
    else if ("admission" in item) {
      const program = item["admission"]
      if (programList.includes(program)) {
        checkResults.push(true)
      } else {
        checkResults.push(false)
      }
      // {"consent": "the Department"}
    } else if ("consent" in item) {
      checkResults.push(true)

      //{"courses": {"required": 1, "from": [{"course": "BMEN319"}, {"course": "ENGG319"}, {"course": "ENEL419"}]}}
    } else if ("courses" in item) {
      const required = parseInt(item.courses.required)
      // Extract the courses and store them in a list
      const requiredList = item.courses.from.map((item) => item.course)
      let fulfilled = 0
      for (const c in requiredList) {
        if (courseList.includes(requiredList[c])) {
          fulfilled += 1
        }
      }
      // If completed more than or equals then we pass
      if (fulfilled >= required) {
        checkResults.push(true)
      } else {
        checkResults.push(false)
      }
    }
  }
  console.log(checkResults, checkList)
  //And condition check
  if ("and" in prereq) {
    if (checkResults.includes(false)) {
      return false
    } else {
      return true
    }
    //Or condition check
  } else {
    if (checkResults.includes(true)) {
      return true
    }
  }
  return false
}
*/

/*
const testList : any[] = [
  {"course": "CHEM351"},
  {"units": {"required": 3, "from": [{"course": "GEOG211"}, {"course": "GEOG308"}, {"course": "GEOG310"}]}},
  {"units": {"required": 15, "from": {"subject_code": "ART"}}},
  {"and": [{"admission": "Honours in Visual Studies"}, {"course": "ART561"}]},
  {"and": [{"course": "ENEL471"}, {"courses": {"required": 1, "from": [{"course": "BMEN319"}, {"course": "ENGG319"}, {"course": "ENEL419"}]}}]},
  {"and": [{"units": {"required": 15}}, {"consent": "the Department"}]}
]

console.log(processPrereq(testList[5], ["ENEL471", "GEOG211", "ENGG319", "ART123", "ART124", "ART125","ART561"],["Honours in Visual Studies"]))*/
