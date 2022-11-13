/* 11/1 Sumantra Sharma. Source - https://chadalen.com/blog/how-to-use-a-multipart-form-in-nextjs-using-api-routes
* */

import multiparty from 'multiparty'

export default async function parseMultipartForm (req, res, next) {
  const form = new multiparty.Form()
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log(err)
      next()
    }
    req.body = fields
    req.files = files
    next()
  })
}
