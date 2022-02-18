import FileUploadIcon from '@mui/icons-material/FileUpload'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import LoadingButton from '@mui/lab/LoadingButton'
import {
	Alert,
	Box,
	Button,
	Chip,
	Container,
	FormControl,
	IconButton,
	InputAdornment,
	OutlinedInput,
	Paper,
	Snackbar,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import {
	generatePrimeList,
	getBalanceNumber,
	getPrivateKey,
	moduloInverseEuclidean,
	randomizeTwoPrime,
} from './rsa-signature'

export interface IDigitalSignatureProps {}

interface State {
	p: number
	q: number
	password: string | number
	publicKey: number
	privateKey: number
	message: string
	openSnackbar: boolean
	initialFile: any
	selectedFile: any
	content: any
	text: string
	checkingContent: any
	textChecking: string
	showPassword: boolean
	fileResult: any
	selectedCheckingFile: any
	fileChecking: any
	resultFileChecking: any
}

export default function DigitalSignature() {
	const [values, setValues] = useState<State>({
		p: 0,
		q: 0,
		password: 'default',
		publicKey: 0,
		privateKey: 0,
		message: '',
		openSnackbar: false,
		initialFile: null,
		selectedFile: null,
		content: null,
		text: '',
		checkingContent: null,
		textChecking: '',
		showPassword: false,
		fileResult: null,
		selectedCheckingFile: null,
		fileChecking: null,
		resultFileChecking: null,
	})

	const generateTwoPrime = (n: number) => {
		const numberList = randomizeTwoPrime(n)
		setValues({
			...values,
			p: numberList.p,
			q: numberList.q,

			openSnackbar: false,
		})
	}

	const generateKey = () => {
		const isCreated = values.p !== 0 && values.q !== 0
		if (!isCreated) {
			setValues({
				...values,
				message: 'Cần khởi tạo 2 số nguyên tố ngẫu nhiên',
				openSnackbar: true,
			})
			return
		} else {
			const n = values.p * values.q
			const delN = (values.p - 1) * (values.q - 1)
			// list prime number small than delN
			const primeList = generatePrimeList(delN)
			const privateKey: number = getPrivateKey(primeList, delN)
			const publicKey: number = moduloInverseEuclidean(privateKey, delN) || 0
			setValues({
				...values,
				openSnackbar: false,
				privateKey: privateKey,
				publicKey: publicKey,
			})
		}
	}

	const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return
		}
		setValues({
			...values,

			openSnackbar: false,
		})
	}

	const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
		setValues({ ...values, [prop]: event.target.value })
	}

	const handleClickShowPassword = () => {
		setValues({
			...values,
			showPassword: !values.showPassword,
		})
	}

	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault()
	}

	// upload
	const handleCapture = async (e: any) => {
		e.preventDefault()
		setValues({
			...values,
			selectedFile: e.target.files[0],
			initialFile: e,
		})
	}

	const readFile = async (e: any) => {
		if (!values.initialFile) {
			setValues({
				...values,
				initialFile: null,
			})
			return
		}
		const reader = new FileReader()
		reader.onload = async (e: any) => {
			const regex = /\d+/g
			const text = e.target.result
			const content = text.match(regex).map(Number) // to array
			setValues({
				...values,
				content: content,
				text: text,
			})
		}
		reader.readAsText(e.target.files[0])
	}
	useEffect(() => {
		readFile(values.initialFile)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [values.initialFile, values.text])

	// upload for checking
	const handleUploadChecking = async (e: any) => {
		e.preventDefault()
		setValues({
			...values,
			selectedCheckingFile: e.target.files[0],
			fileChecking: e,
		})
	}

	const readCheckingFile = async (e: any) => {
		if (!values.fileChecking) {
			setValues({
				...values,
				fileChecking: null,
			})
			return
		}
		const reader = new FileReader()
		reader.onload = async (e: any) => {
			const regex = /\d+/g
			const text = e.target.result
			const checkingContent = text.match(regex).map(Number)
			setValues({
				...values,
				checkingContent: checkingContent,
				textChecking: text,
			})
		}
		reader.readAsText(e.target.files[0])
	}
	useEffect(() => {
		readCheckingFile(values.fileChecking)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [values.fileChecking])

	const sign = () => {
		if (!values.selectedFile || !values.privateKey) {
			setValues({
				...values,
				message: 'Bạn cần khởi tạo khóa',
				openSnackbar: true,
			})
			return
		}
		let fileResult = []
		for (let i = 0; i < values.content.length; i++) {
			fileResult.push(getBalanceNumber(values.content[i], values.privateKey, values.p * values.q))
		}
		const txtFileContent = fileResult.join(', ')
		setValues({
			...values,
			message: 'Ký thành công',
			openSnackbar: true,
			fileResult: txtFileContent,
		})
	}

	const checking = () => {
		if (!values.selectedCheckingFile || !values.checkingContent) {
			setValues({
				...values,
				message: 'Bạn cần ký văn bản',
				openSnackbar: true,
			})
			return
		}
		let arrayChecking = []
		for (let i = 0; i < values.checkingContent.length; i++) {
			arrayChecking.push(
				getBalanceNumber(values.checkingContent[i], values.publicKey, values.p * values.q)
			)
		}
		const txtFileContentChecking = arrayChecking.join(', ')
		setValues({
			...values,
			message: 'Văn bản đã xác thực',
			openSnackbar: true,
			resultFileChecking: txtFileContentChecking,
		})
	}

	const saveFile = () => {
		const element = document.createElement('a')
		const file = new Blob([values.fileResult], { type: 'text/plain' })
		element.href = URL.createObjectURL(file)
		element.download = 'result-file.txt'
		document.body.appendChild(element) // Required for this to work in FireFox
		element.click()
	}

	const saveCheckingFile = () => {
		const element = document.createElement('a')
		const file = new Blob([values.resultFileChecking], { type: 'text/plain' })
		element.href = URL.createObjectURL(file)
		element.download = 'result-checking-file.txt'
		document.body.appendChild(element) // Required for this to work in FireFox
		element.click()
	}

	return (
		<Box component="section" my={8}>
			<Container>
				<Paper elevation={3}>
					<Stack direction="column" alignItems="center" sx={{ width: '100%', px: 2 }}>
						<Snackbar
							anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
							open={values.openSnackbar}
							autoHideDuration={6000}
							onClose={handleCloseSnackbar}
						>
							<Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
								{values.message}
							</Alert>
						</Snackbar>
						<fieldset>
							<legend>
								<Typography variant="h5">Sinh khóa</Typography>
							</legend>
							<Box
								sx={{
									display: { xs: 'block', md: 'flex' },
									alignItems: 'center',
								}}
							>
								<div>
									<Typography>1. Chọn 2 số nguyên tố ngẫu nhiên:</Typography>
								</div>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
									}}
								>
									<Typography sx={{ ml: { xs: 0, md: 2 } }}>p</Typography>
									<Chip variant="basic" label={values.p} size="small" sx={{ ml: 1, width: 50 }} />
									<Typography sx={{ ml: 2 }}>q</Typography>
									<Chip variant="basic" label={values.q} size="small" sx={{ ml: 1, width: 50 }} />
								</Box>
							</Box>
							<Box
								sx={{
									display: { xs: 'block', md: 'flex' },
									alignItems: 'center',
									justifyContent: 'space-between',
								}}
							>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<Typography mr={1}>2. Khóa bí mật:</Typography>
									<FormControl
										sx={{ my: 1, width: { xs: '20ch', md: '25ch' } }}
										size="small"
										variant="outlined"
									>
										<OutlinedInput
											id="outlined-adornment-password"
											type={values.showPassword ? 'text' : 'password'}
											value={values.privateKey}
											onChange={handleChange('password')}
											endAdornment={
												<InputAdornment position="end">
													<IconButton
														aria-label="toggle password visibility"
														onClick={handleClickShowPassword}
														onMouseDown={handleMouseDownPassword}
														edge="end"
													>
														{values.showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											}
										/>
									</FormControl>
								</Box>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<Typography mr={1}>Khóa công khai</Typography>
									<Typography
										sx={{
											width: { xs: '20ch', md: '25ch' },
											my: 1,
											p: 1,
											backgroundColor: '#00000014',
											borderRadius: 4,
											textOverflow: 'ellipsis',
											overflow: 'hidden',
										}}
									>
										{values.publicKey}
									</Typography>
								</Box>
							</Box>
							<Box
								sx={{
									textAlign: 'end',
									my: 1,
								}}
							>
								<Tooltip title="Chọn ngẫu nhiên">
									{/* generate random two prime small than 20 */}
									<Button variant="contained" sx={{ mr: 1 }} onClick={() => generateTwoPrime(20)}>
										Ngẫu nhiên
									</Button>
								</Tooltip>
								<Tooltip title="Tạo khóa">
									<Button variant="contained" onClick={() => generateKey()}>
										Sinh khóa
									</Button>
								</Tooltip>
							</Box>
						</fieldset>
						<fieldset>
							<legend>
								<Typography variant="h5">Ký văn bản</Typography>
							</legend>
							<Box
								sx={{
									display: { xs: 'block', md: 'flex' },
									alignItems: 'center',
								}}
							>
								<Typography minWidth={{ xs: '100%', md: '10%' }}>Văn bản</Typography>
								<Box
									sx={{
										width: '100%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<Typography
										sx={{
											width: { md: 575, xs: 225 },
											p: 1,
											backgroundColor: '#00000014',
											borderRadius: 4,
											textOverflow: 'ellipsis',
											overflow: 'hidden',
											whiteSpace: 'nowrap',
										}}
									>
										{values.text ? values.text : 'Chọn tập tin'}
									</Typography>
									<Box>
										<input
											accept="text/plain"
											id="textFile"
											type="file"
											onChange={(e) => handleCapture(e)}
											hidden
										/>
										<Tooltip title="Chọn tập tin">
											<label htmlFor="textFile">
												<LoadingButton
													component="span"
													variant="contained"
													endIcon={<FileUploadIcon />}
													// loading={selectedFile}
													loadingPosition="end"
												>
													Chọn
												</LoadingButton>
											</label>
										</Tooltip>
									</Box>
								</Box>
							</Box>
							<Box
								sx={{
									display: { xs: 'block', md: 'flex' },
									alignItems: 'center',
								}}
							>
								<Typography minWidth={{ xs: '100%', md: '10%' }}>Kết quả</Typography>
								<Box
									sx={{
										width: '100%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<Typography
										sx={{
											width: { md: 677, xs: 322 },
											my: 1,
											p: 1,
											backgroundColor: '#00000014',
											borderRadius: 4,
											textOverflow: 'ellipsis',
											overflow: 'hidden',
											whiteSpace: 'nowrap',
										}}
									>
										{values.fileResult ? values.fileResult : 'File'}
									</Typography>
								</Box>
							</Box>
							<Box
								sx={{
									textAlign: 'end',
									my: 1,
								}}
							>
								<Button
									variant="contained"
									sx={{ mr: 1 }}
									disabled={!values.fileResult}
									onClick={() => saveFile()}
								>
									Xuất kết quả
								</Button>
								<Button variant="contained" disabled={!values.selectedFile} onClick={() => sign()}>
									Ký văn bản
								</Button>
							</Box>
						</fieldset>
						<fieldset>
							<legend>
								<Typography variant="h5">Xác thực chữ ký</Typography>
							</legend>
							<Box
								sx={{
									display: { xs: 'block', md: 'flex' },
									alignItems: 'center',
								}}
							>
								<Typography minWidth={{ xs: '100%', md: '10%' }}>Văn bản</Typography>
								<Box
									sx={{
										width: '100%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<Typography
										sx={{
											width: { md: 575, xs: 225 },
											p: 1,
											backgroundColor: '#00000014',
											borderRadius: 4,
											textOverflow: 'ellipsis',
											overflow: 'hidden',
											whiteSpace: 'nowrap',
										}}
									>
										{values.textChecking ? values.textChecking : 'Chọn tập tin'}
									</Typography>
									<Box>
										<input
											accept="text/plain"
											id="textFileChecking"
											type="file"
											onChange={(e) => handleUploadChecking(e)}
											hidden
										/>
										<Tooltip title="Chọn tập tin">
											<label htmlFor="textFileChecking">
												<LoadingButton
													component="span"
													variant="contained"
													endIcon={<FileUploadIcon />}
													// loading={selectedFile}
													loadingPosition="end"
												>
													Chọn
												</LoadingButton>
											</label>
										</Tooltip>
									</Box>
								</Box>
							</Box>
							<Box
								sx={{
									display: { xs: 'block', md: 'flex' },
									alignItems: 'center',
								}}
							>
								<Typography minWidth={{ xs: '100%', md: '10%' }}>Kết quả</Typography>
								<Box
									sx={{
										width: '100%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<Typography
										sx={{
											width: { md: 677, xs: 322 },
											my: 1,
											p: 1,
											backgroundColor: '#00000014',
											borderRadius: 4,
											textOverflow: 'ellipsis',
											overflow: 'hidden',
											whiteSpace: 'nowrap',
										}}
									>
										{values.resultFileChecking ? values.resultFileChecking : 'File'}
									</Typography>
								</Box>
							</Box>
							<Box
								sx={{
									textAlign: 'end',
									my: 1,
								}}
							>
								<Button
									variant="contained"
									sx={{ mr: 1 }}
									disabled={!values.fileResult}
									onClick={() => saveCheckingFile()}
								>
									Xuất kết quả
								</Button>
								<Button
									variant="contained"
									disabled={!values.selectedCheckingFile}
									onClick={() => checking()}
								>
									Xác thực
								</Button>
							</Box>
						</fieldset>
					</Stack>
				</Paper>
			</Container>
		</Box>
	)
}
