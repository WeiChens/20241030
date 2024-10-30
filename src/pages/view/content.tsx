import { ChangeEvent, useRef, useState } from 'react'
import styles from './css/content.module.scss'
import Image from 'next/image'
import { Document, Page, pdfjs } from 'react-pdf'
import { PDFDocument, degrees } from 'pdf-lib'
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'
async function getUint8ArrayFromURL(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const buffer = await response.arrayBuffer()
    return new Uint8Array(buffer)
  } catch (error) {
    console.error(error)
    return null
  }
}
export default function Content() {
  const inputFileRef = useRef(null as unknown as HTMLInputElement)
  function onChangeFile(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) {
      return
    }
    fileName.current = e.target.files[0].name
    setFileUrl(URL.createObjectURL(e.target.files[0]))
  }
  // const [pageNumber, setNumber] = useState(1)
  const [fileUrl, setFileUrl] = useState('' as string)
  const fileName = useRef('')
  const [pageWidth, _setPageWidth] = useState(350)
  function setPageWidth(width: number) {
    if (width < 150 || width > 1000) {
      return
    }
    _setPageWidth(width)
  }
  const [documentProxy, setDocumentProxy] = useState(
    null as unknown as pdfjs.PDFDocumentProxy
  )
  // 文档旋转度数
  const [documentRotates, setDocumentRotates] = useState([] as number[])
  const [aspectRatioList, setaspectRatioList] = useState([] as number[])
  const getPageSize = (index: number) => {
    const aspectRatio = aspectRatioList[index]
    return Math.max(pageWidth / aspectRatio, pageWidth)
  }
  function rotateallHandle(): void {
    setDocumentRotates((arr) => {
      return arr.map((item) => item + 90)
    })
  }
  // const handleDownload = async () => {
  //   const loadingTask = pdfjsLib.getDocument(fileUrl)
  //   let doc: jsPDF = null as unknown as jsPDF
  //   loadingTask.promise.then(async (pdf) => {
  //     console.log(await pdf.getFieldObjects())

  //     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  //       const page = await pdf.getPage(pageNum)
  //       const oldViewport = page.getViewport({ scale: 2 })
  //       const viewport = page.getViewport({
  //         scale: 2,
  //         rotation: oldViewport.rotation + (documentRotates[pageNum - 1] % 360),
  //       })
  //       // console.log(oldViewport.rotation, viewport.rotation)
  //       const canvas = document.createElement('canvas')
  //       const context = canvas.getContext('2d')
  //       canvas.height = viewport.height
  //       canvas.width = viewport.width

  //       await page.render({
  //         canvasContext: context!,
  //         viewport: viewport,
  //       }).promise
  //       const imgData = canvas.toDataURL('image/png')
  //       if (doc === null) {
  //         console.log([viewport.width, viewport.height])
  //         doc = new jsPDF(viewport.height > viewport.width ? 'p' : 'l', 'pt', [
  //           viewport.height,
  //           viewport.width,
  //         ])
  //       } else {
  //         doc.addPage(
  //           [viewport.height, viewport.width],
  //           viewport.height > viewport.width ? 'p' : 'l'
  //         )
  //       }
  //       doc.addImage(imgData, 'PNG', 0, 0, viewport.width, viewport.height)
  //       const ctx = await page.getTextContent()
  //       ctx.items.forEach((item) => {
  //         if ('str' in item) {
  //           // console.log(item.str)
  //           doc.text(item.str, item.transform[4], item.transform[5])
  //         }
  //       })
  //     }
  //     let name = fileName.current
  //     name = name.substring(0, name.lastIndexOf('.pdf'))
  //     doc.save(`${name}(pdf.ai-rotated).pdf`)
  //   })
  // }

  const handleDownload = async () => {
    let array = await getUint8ArrayFromURL(fileUrl)
    if (array == null) {
      return
    }
    const doc = await PDFDocument.load(array)
    const pageSize = doc.getPageCount()

    for (let i = 0; i < pageSize; i++) {
      const page = doc.getPage(i)
      page.setRotation(
        degrees(page.getRotation().angle + (documentRotates[i] % 360))
      )
    }
    let name = fileName.current
    name = name.substring(0, name.lastIndexOf('.pdf'))
    const blob = new Blob([await doc.save()], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name}(pdf.ai-rotated).pdf`
    link.click()
  }

  return (
    <main className={styles.root}>
      <div className={styles.title}>Rotate PDF Pages</div>
      <div className={styles.desc}>
        Simply click on a page to rotate it. You can then download your modified
        PDF.
      </div>
      <input
        ref={inputFileRef}
        className="hidden"
        type="file"
        id="input-file-upload"
        onChange={onChangeFile}
        accept=".pdf"
      />
      {!fileUrl && (
        <div
          className={styles['upload-box']}
          onClick={() => inputFileRef.current?.click()}>
          <Image
            alt=""
            width={32}
            height={32}
            src={'/upload.svg'}
            className="icon"></Image>
          <div className={styles['tips']}>Click to upload or drag and drop</div>
        </div>
      )}
      {fileUrl && (
        <>
          <div className={styles.btns}>
            <div className={styles.btn} onClick={rotateallHandle}>
              Rotate all
            </div>
            <div
              className={styles.btn + ' ' + styles.btn2}
              onClick={() => setFileUrl('')}>
              Remove PDF
            </div>
            <div
              className={styles['tool-btn']}
              style={{
                opacity: pageWidth >= 1000 ? 0.5 : 1,
              }}
              onClick={() => setPageWidth(pageWidth + 50)}>
              <Image src="/scale-add.svg" alt="" width={20} height={20}></Image>
            </div>
            <div
              className={styles['tool-btn']}
              style={{
                opacity: pageWidth <= 150 ? 0.5 : 1,
              }}
              onClick={() => setPageWidth(pageWidth - 50)}>
              <Image src="/scale-sub.svg" alt="" width={20} height={20}></Image>
            </div>
          </div>
          <div
            style={{
              minHeight: '1000px',
              padding: '30px 10px',
            }}>
            <Document
              className={styles.document}
              file={fileUrl}
              onLoadSuccess={(e) => {
                // console.log(e)
                setDocumentRotates(new Array(e.numPages).fill(0))
                setaspectRatioList(new Array(e.numPages).fill(1))
                setDocumentProxy(e)
              }}
              onLoad={(e) => {
                console.log(e)
              }}>
              {documentProxy &&
                documentProxy.numPages > 0 &&
                new Array(documentProxy.numPages).fill(0).map((_, i) => {
                  return (
                    <div
                      key={i}
                      className={styles['page-container']}
                      style={{
                        width: `${getPageSize(i)}px`,
                        height: `${getPageSize(i) + 30}px`,
                      }}
                      onClick={() => {
                        let rot = documentRotates[i]
                        rot = rot + 90
                        const newRotates = [...documentRotates]
                        newRotates[i] = rot
                        setDocumentRotates(newRotates)
                      }}>
                      <div
                        className={styles.page}
                        style={{
                          transform: `rotate(${documentRotates[i]}deg)`,
                          margin: 'auto',
                        }}>
                        <Page
                          // renderMode="custom"
                          onLoadSuccess={(e) => {
                            setaspectRatioList((arr) => {
                              arr[i] = e.originalWidth / e.originalHeight
                              if (e.rotate % 180 != 0) {
                                arr[i] = e.originalHeight / e.originalWidth
                              }
                              return [...arr]
                            })
                          }}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                          pageNumber={i + 1}
                          width={pageWidth}
                        />
                      </div>
                      <span className={styles['page-num']}>{i + 1}</span>
                      <div className={styles['rot-btn']}>
                        <Image
                          src="/rotate.svg"
                          alt=""
                          width={12}
                          height={12}></Image>
                      </div>
                    </div>
                  )
                })}
            </Document>
            <div className={styles.btns}>
              <div className={styles.btn} onClick={handleDownload}>
                Download
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
