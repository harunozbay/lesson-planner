/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_LESSONPLANNERSTORAGE_BUCKETNAME
	TEMPLATE_KEY
	OUTPUT_DIR
Amplify Params - DO NOT EDIT */

/*
 * Lambda: Plan DOCX generator
 *
 */

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Buffer } from "buffer";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    console.log("Incoming event:", event);

    // Body parse
    let body;
    if (event.arguments) {
      // AppSync invocation
      body = event.arguments;
    } else {
      // API Gateway or direct invocation
      body =
        typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    }

    // Template info
    const TEMPLATE_BUCKET = process.env.STORAGE_LESSONPLANNERSTORAGE_BUCKETNAME;
    const TEMPLATE_KEY = process.env.TEMPLATE_KEY;

    // 1. Template S3'ten indir
    const templateFile = await s3.send(
      new GetObjectCommand({
        Bucket: TEMPLATE_BUCKET,
        Key: TEMPLATE_KEY,
      })
    );

    const templateBuffer = await streamToBuffer(templateFile.Body);

    // 2. Docxtemplater setup
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 3. DOCX içine data bağlama
    // sections ve fields JSON string olarak gelebilir (AppSync AWSJSON)
    const sections =
      typeof body.sections === "string"
        ? JSON.parse(body.sections)
        : body.sections;
    const fields =
      typeof body.fields === "string" ? JSON.parse(body.fields) : body.fields;

    doc.setData({
      hafta_no: body.hafta_no,
      tarih_araligi: body.tarih_araligi,
      kurum_adi: body.kurum_adi,
      muzik_listesi: Array.isArray(body.muzik_listesi)
        ? body.muzik_listesi.join(", ")
        : body.muzik_listesi,

      ...sections, // başlıklar
      ...fields, // günlük içerikler
    });

    doc.render();

    const generatedBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // 4. Output dosyasını S3’e yükle
    const outputKey = `plans/${uuidv4()}.docx`;

    await s3.send(
      new PutObjectCommand({
        Bucket: TEMPLATE_BUCKET,
        Key: outputKey,
        Body: generatedBuffer,
        ContentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
    );

    const fileUrl = `https://${TEMPLATE_BUCKET}.s3.amazonaws.com/${outputKey}`;

    const responseData = { url: fileUrl };

    if (event.arguments) {
      // AppSync response (Schema defines return type as String)
      return JSON.stringify(responseData);
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(responseData),
    };
  } catch (err) {
    console.error(err);
    if (event.arguments) {
      throw new Error(err.message);
    }
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
