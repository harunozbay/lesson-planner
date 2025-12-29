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
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Buffer } from "buffer";
import Docxtemplater from "docxtemplater";
import InspectModule from "docxtemplater/js/inspect-module.js";
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
    const iModule = new InspectModule();
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [iModule],
      delimiters: {
        start: "{{",
        end: "}}",
      },
    });

    // 3. DOCX içine data bağlama
    // sections ve fields JSON string olarak gelebilir (AppSync AWSJSON)
    const sections =
      typeof body.sections === "string"
        ? JSON.parse(body.sections)
        : body.sections || {};
    const fields =
      typeof body.fields === "string"
        ? JSON.parse(body.fields)
        : body.fields || {};

    // Debug: Gelen veriyi logla
    console.log("Raw body.fields:", body.fields);
    console.log("Parsed fields:", JSON.stringify(fields, null, 2));

    // Template'deki tüm tag'leri logla (debug için)
    const allTags = iModule.getAllTags();
    console.log("Template tags:", JSON.stringify(allTags, null, 2));

    // Günler için null-safe objeler oluştur
    const pazartesi = fields.pazartesi || {};
    const sali = fields.sali || {};
    const carsamba = fields.carsamba || {};
    const persembe = fields.persembe || {};
    const cuma = fields.cuma || {};

    // Flat key formatında templateData oluştur ({{pazartesi.genel}} -> "pazartesi.genel" key)
    const templateData = {
      hafta_no: body.hafta_no || "",
      tarih_araligi: body.tarih_araligi || "",
      kurum_adi: body.kurum_adi || "",
      muzik_listesi: Array.isArray(body.muzik_listesi)
        ? body.muzik_listesi.join(", ")
        : body.muzik_listesi || "",

      // Pazartesi
      "pazartesi.genel": pazartesi.genel || "",
      "pazartesi.kuran": pazartesi.kuran || "",
      "pazartesi.dini_bilgiler": pazartesi.dini_bilgiler || "",
      "pazartesi.degerler_egitimi": pazartesi.degerler_egitimi || "",
      "pazartesi.tamamlayici_kazanim": pazartesi.tamamlayici_kazanim || "",

      // Salı
      "sali.genel": sali.genel || "",
      "sali.kuran": sali.kuran || "",
      "sali.dini_bilgiler": sali.dini_bilgiler || "",
      "sali.degerler_egitimi": sali.degerler_egitimi || "",
      "sali.tamamlayici_kazanim": sali.tamamlayici_kazanim || "",

      // Çarşamba
      "carsamba.genel": carsamba.genel || "",
      "carsamba.kuran": carsamba.kuran || "",
      "carsamba.dini_bilgiler": carsamba.dini_bilgiler || "",
      "carsamba.degerler_egitimi": carsamba.degerler_egitimi || "",
      "carsamba.tamamlayici_kazanim": carsamba.tamamlayici_kazanim || "",

      // Perşembe
      "persembe.genel": persembe.genel || "",
      "persembe.kuran": persembe.kuran || "",
      "persembe.dini_bilgiler": persembe.dini_bilgiler || "",
      "persembe.degerler_egitimi": persembe.degerler_egitimi || "",
      "persembe.tamamlayici_kazanim": persembe.tamamlayici_kazanim || "",

      // Cuma
      "cuma.genel": cuma.genel || "",
      "cuma.kuran": cuma.kuran || "",
      "cuma.dini_bilgiler": cuma.dini_bilgiler || "",
      "cuma.degerler_egitimi": cuma.degerler_egitimi || "",
      "cuma.tamamlayici_kazanim": cuma.tamamlayici_kazanim || "",

      ...sections,
    };

    console.log("Final templateData:", JSON.stringify(templateData, null, 2));

    doc.setData(templateData);

    try {
      doc.render();
    } catch (renderError) {
      // Docxtemplater multi-error detaylı loglama
      if (renderError.properties && renderError.properties.errors) {
        console.error("Docxtemplater render errors:");
        renderError.properties.errors.forEach((err, idx) => {
          console.error(`Error ${idx + 1}:`, {
            message: err.message,
            id: err.properties?.id,
            explanation: err.properties?.explanation,
            xtag: err.properties?.xtag,
          });
        });
      }
      throw renderError;
    }

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

    // Pre-signed URL oluştur (1 saat geçerli)
    const fileUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: TEMPLATE_BUCKET,
        Key: outputKey,
      }),
      { expiresIn: 3600 }
    );

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
    console.error("Error occurred:", err);

    // Docxtemplater multi-error durumunda detaylı loglama
    if (err.properties && err.properties.errors) {
      console.error("Docxtemplater detailed errors:");
      err.properties.errors.forEach((e, idx) => {
        console.error(
          `Error ${idx + 1}:`,
          JSON.stringify(
            {
              message: e.message,
              id: e.properties?.id,
              explanation: e.properties?.explanation,
              xtag: e.properties?.xtag,
              offset: e.properties?.offset,
              file: e.properties?.file,
            },
            null,
            2
          )
        );
      });
    }

    const errorMessage = err.properties?.errors
      ? err.properties.errors.map((e) => e.message).join("; ")
      : err.message;

    if (event.arguments) {
      throw new Error(errorMessage);
    }
    return { statusCode: 500, body: JSON.stringify({ error: errorMessage }) };
  }
};

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
