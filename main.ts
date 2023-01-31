import fragmentShader from './shader.hlsl?raw'

let resolution: [number, number] = [] as any
let zoom: number = 0.2
let offset = [0, 0]
let delta = 1.001
let initialPan = [0, 0]
let pan = [0, 0]
let mousePressed = 0
function to_map(point: number[]) {
    let buf = [...point]
    buf[0] -= resolution[0] / 2
    buf[1] -= resolution[1] / 2
    buf[0] /= resolution[0]
    buf[1] /= resolution[1]
    buf[0] /= zoom
    buf[1] /= zoom
    return buf
}

const glsl = x => x

const createProgram = (gl: WebGL2RenderingContext, vertexShader: string, fragmentShader: string) => {
    const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
        const shader = gl.createShader(type)!
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        if (!success) {
            const info = gl.getShaderInfoLog(shader)
            gl.deleteShader(shader)
            throw new Error('Shader compile error: ' + info)
        }
        return shader
    }

    const program = gl.createProgram()!
    // просто добавляем шейдеры они пока не знают друг о друга
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShader)!)
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShader)!)
    // сопрягаем уже
    gl.linkProgram(program)
    const linkSuccess = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!linkSuccess) {
        const info = gl.getProgramInfoLog(program)
        gl.deleteProgram(program)
        throw new Error('Program link error: ' + info)
    }

    return program
}

const updateStat = (name: string, value: string | number) => {
    const stat = document.querySelector('#stats')
    if (stat) {
        for (const child of stat.children as unknown as HTMLElement[]) {
            if (child.dataset.name !== name) continue
            child.textContent = value.toString()
        }
    }
}

const setupCanvas = (canvas: HTMLCanvasElement) => {
    const upscaleResolution = window.devicePixelRatio

    const gl = canvas.getContext('webgl2', {
        // doesn't switch the gpu on Windows https://github.com/emscripten-core/emscripten/issues/10000#issuecomment-749167911
        powerPreference: 'high-performance',
    })

    if (!gl) {
        throw new Error('WebGL2 not supported')
    }

    const resize = () => {
        canvas.width = window.innerWidth * upscaleResolution
        canvas.height = window.innerHeight * upscaleResolution
        resolution[0] = canvas.width
        resolution[1] = canvas.height
    }

    resize()
    window.addEventListener('resize', resize)

    const shaderProgram = createProgram(
        gl,
        glsl`
        attribute vec3 position;
			void main() {
				gl_Position = vec4( position, 1.0 );
			}`,
        fragmentShader,
    )

    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'position')

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    const vao = gl.createVertexArray()

    gl.bindVertexArray(vao)
    gl.enableVertexAttribArray(positionAttributeLocation)

    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    gl.useProgram(shaderProgram)
    gl.clearColor(0, 0, 0.5, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'zoom'), zoom)

    const updateMoveUniform = () => {
        gl.uniform2f(gl.getUniformLocation(shaderProgram, 'move'), offset[0], offset[1])
    }
    const updateZoom = (factor: number, x: number, y: number) => {
        const buf = to_map([x, y])
        if (factor > 0) zoom /= 1 + factor / 250
        else zoom *= 1 + -factor / 250

        const buf1 = to_map([x, y])
        offset[0] += buf[0] - buf1[0]
        offset[1] -= buf[1] - buf1[1]
        gl.uniform1f(gl.getUniformLocation(shaderProgram, 'zoom'), zoom)
        updateMoveUniform()
        updateStat('zoom', zoom)
    }
    const fixedAddEventListener = (type: keyof GlobalEventHandlersEventMap, handler: (e: PointerEvent) => void, options = {}) => {
        window.addEventListener(
            type as any,
            e => {
                // const clonedEv = Object.create(null)
                // for (const [key, value] of Object.entries(e)) {
                //     if (typeof value === 'function') {
                //         clonedEv[key] = value.bind(e)
                //         continue
                //     }
                //     clonedEv[key] = value
                //     if ((key === 'clientX' || key === 'clientY') && typeof value === 'number') clonedEv[key] = value * upscaleResolution
                // }
                handler({
                    preventDefault() {
                        e.preventDefault()
                    },
                    clientX: e.clientX * upscaleResolution,
                    clientY: e.clientY * upscaleResolution,
                    deltaY: e.deltaY,
                } as any)
            },
            options,
        )
    }

    // fixedAddEventListener('dblclick', e => {
    //     updateZoom(zoom, e.clientX, e.clientY)
    // })
    fixedAddEventListener(
        'wheel',
        e => {
            const { deltaY, clientX, clientY } = e as any
            updateZoom(deltaY, clientX, clientY)
            e.preventDefault()
        },
        {
            passive: false,
        },
    )
    window.addEventListener(
        'scroll',
        e => {
            e.preventDefault()
            updateZoom(window.scrollY, canvas.width / 2, canvas.height / 2)
        },
        {
            passive: false,
        },
    )

    const evCache: PointerEvent[] = []
    const pointerDownHandler = (e: PointerEvent) => {
        if (evCache.length > 1) return // ignore move when pinch zoom
        // console.log('down')
        mousePressed = 1
        initialPan = [e.clientX, e.clientY]
        pan = [0, 0]
        pan[0] += resolution[0] / 2
        pan[1] += resolution[1] / 2
    }
    const pointerUpHandler = (e: PointerEvent) => {
        if (!mousePressed) return
        // console.log('up', pan, mousePressed)
        pan = to_map(pan)
        offset[0] += pan[0]
        offset[1] -= pan[1]
        mousePressed = 0
        updateMoveUniform()
    }
    fixedAddEventListener('pointerdown', e => {
        if (evCache.length > 1) {
            pointerUpHandler(e)
            return
        }
        pointerDownHandler(e)
        e.preventDefault()
    })
    fixedAddEventListener('pointermove', e => {
        if (evCache.length > 1) return // ignore move when pinch zoom
        if (!mousePressed) return
        pan = [initialPan[0] - e.clientX, initialPan[1] - e.clientY]
        pan[0] += resolution[0] / 2
        pan[1] += resolution[1] / 2
        let buf = to_map(pan)
        //offset[0] += buf[0]
        //offset[1] += buf[1]
        gl.uniform2f(gl.getUniformLocation(shaderProgram, 'move'), offset[0] + buf[0], offset[1] - buf[1])
    })
    fixedAddEventListener('pointerup', e => {
        if (evCache.length === 0) {
            if (mousePressed) pointerUpHandler(e)
            return
        }
        // if (!mousePressed) {
        //     pointerDownHandler(e)
        //     return
        // }
    })

    const renderFrame = () => {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        gl.uniform2f(gl.getUniformLocation(shaderProgram, 'resolution'), resolution[0], resolution[1])
        //gl.uniform2f(gl.getUniformLocation(shaderProgram, 'move'), offset[0], offset[1])
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), gl.STATIC_DRAW)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const updateUniformResize = () => {
        gl.uniform2f(gl.getUniformLocation(shaderProgram, 'resolution'), canvas.width, canvas.height)
    }

    updateUniformResize()
    window.addEventListener('resize', updateUniformResize)

    const requestRenderFrame = () => {
        renderFrame()
        requestAnimationFrame(requestRenderFrame)
    }

    requestRenderFrame()

    function initPointerEvents(el: HTMLElement) {
        // Install event handlers for the pointer target
        let prevDiff = -1
        el.onpointerdown = ev => {
            evCache.push(ev)
        }
        el.onpointermove = ev => {
            // Find this event in the cache and update its record with this event
            const index = evCache.findIndex(cachedEv => cachedEv.pointerId === ev.pointerId)
            evCache[index] = ev

            // If two pointers are down, check for pinch gestures
            if (evCache.length === 2) {
                const curDiff = Math.hypot(evCache[0].clientX - evCache[1].clientX, evCache[0].clientY - evCache[1].clientY)

                const clientX = (evCache[0].clientX + evCache[1].clientX) / 2
                const clientY = (evCache[0].clientY + evCache[1].clientY) / 2
                if (prevDiff > 0) {
                    const factor = curDiff - prevDiff
                    updateZoom(-factor, clientX * upscaleResolution, clientY * upscaleResolution)
                }

                // Cache the distance for the next move event
                prevDiff = curDiff
            }
        }

        function pointerupHandler(ev) {
            const index = evCache.findIndex(cachedEv => cachedEv.pointerId === ev.pointerId)
            evCache.splice(index, 1)

            // If the number of pointers down is less than two then reset diff tracker
            if (evCache.length < 2) {
                prevDiff = -1
            }
        }

        // Use same handler for pointer{up,cancel,out,leave} events since
        // the semantics for these events - in this app - are the same.
        el.onpointerup = pointerupHandler
        el.onpointercancel = pointerupHandler
        el.onpointerout = pointerupHandler
        el.onpointerleave = pointerupHandler
    }

    initPointerEvents(canvas)
}

const canvas: HTMLCanvasElement = document.querySelector('canvas#canvas')!
setupCanvas(canvas)
