import { Schema, connection } from "mongoose"

import { CatalogProgramDocument, CatalogProgramModel, CatalogProgramSchema } from "./interfaces.gen"

const schema: CatalogProgramSchema = new Schema(
  {
    active: {
      type: Boolean,
      default: true,
    },
    admission_info: {
      type: String,
      required: true,
    },
    career: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    coursedog_id: {
      type: String,
      required: true,
    },
    degree_designation_code: {
      type: String,
      required: true,
    },
    degree_designation_name: {
      type: String,
      required: true,
    },
    departments: {
      type: [String],
      required: true,
    },
    display_name: {
      type: String,
      required: true,
    },
    general_info: {
      type: String,
      required: true,
    },
    long_name: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    program_group_id: {
      type: String,
      required: true,
    },
    start_term: {
      type: Map,
      required: true,
    },
    transcript_description: {
      type: String,
      required: true,
    },
    transcript_level: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
  },
  {},
)

const CatalogDb = connection.useDb("catalog")
const CatalogProgram = CatalogDb.model<CatalogProgramDocument, CatalogProgramModel>("CatalogProgram", schema, "programs")
export { CatalogProgram }
