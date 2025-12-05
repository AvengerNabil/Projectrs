import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.io.*;

// SudokuBoard class
class SudokuBoard {
    private static final int BOARD_SIZE = 9;
    private static final int NO_VALUE = 0;
    private int[][] board;

    public SudokuBoard(int[][] board) {
        this.board = board;
    }

    public int getSize() {
        return BOARD_SIZE;
    }

    public int getValue(int row, int col)   {return board[row][col];
    }

    public void setValue(int row, int col, int value) {
        board[row][col] = value;
    }

    public boolean isEmpty(int row, int col) {
        return board[row][col] == NO_VALUE;
    }

    public boolean hasDuplicateInRow(int row) {
        boolean[] seen = new boolean[BOARD_SIZE];
        for (int col = 0; col < BOARD_SIZE; col++) {
            int value = board[row][col];
            if (value != NO_VALUE) {
                if (seen[value - 1]) return true;
                seen[value - 1] = true;
            }
        }
        return false;
    }

    public boolean hasDuplicateInCol(int col) {
        boolean[] seen = new boolean[BOARD_SIZE];
        for (int row = 0; row < BOARD_SIZE; row++) {
            int value = board[row][col];
            if (value != NO_VALUE) {
                if (seen[value - 1]) return true;
                seen[value - 1] = true;
            }
        }
        return false;
    }

    public boolean hasDuplicateInSubgrid(int row, int col) {
        boolean[] seen = new boolean[BOARD_SIZE];
        int startRow = row - row % 3;
        int startCol = col - col % 3;
        for (int i = startRow; i < startRow + 3; i++) {
            for (int j = startCol; j < startCol + 3; j++) {
                int value = board[i][j];
                if (value != NO_VALUE) {
                    if (seen[value - 1]) return true;
                    seen[value - 1] = true;
                }
            }
        }
        return false;
    }
}

// SudokuSolver class
class SudokuSolver {
    private static final int MIN_VALUE = 1;
    private static final int MAX_VALUE = 9;
    private SudokuBoard board;

    public SudokuSolver(SudokuBoard board) {
        this.board = board;
    }

    public boolean solve() {
        return solveHelper();
    }

    private boolean solveHelper() {
        for (int row = 0; row < board.getSize(); row++) {
            for (int col = 0; col < board.getSize(); col++) {
                if (board.isEmpty(row, col)) {
                    for (int num = MIN_VALUE; num <= MAX_VALUE; num++) {
                        board.setValue(row, col, num);
                        if (isValid(row, col) && solveHelper()) {
                            return true;
                        }
                        board.setValue(row, col, 0);
                    }
                    return false;
                }
            }
        }
        return true;
    }

    private boolean isValid(int row, int col) {
        return !board.hasDuplicateInRow(row) &&
                !board.hasDuplicateInCol(col) &&
                !board.hasDuplicateInSubgrid(row, col);
    }
}

// Main Sudoku GUI class
public class NewSudoku {
    private JFrame frame;
    private JTextField[][] cells;
    private static final int BOARD_SIZE = 9;
    private static final String COLOR_DEFAULT_EVEN = "#9ACBD0";
    private static final String COLOR_DEFAULT_ODD = "#48A6A7";
    private static final String COLOR_ERROR = "#FF6347"; // Red for errors

    public NewSudoku() {
        frame = new JFrame("Sudoku Solver");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLayout(new BorderLayout());

        JPanel gridPanel = new JPanel(new GridLayout(BOARD_SIZE, BOARD_SIZE));
        cells = new JTextField[BOARD_SIZE][BOARD_SIZE];

        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                cells[row][col] = new JTextField();
                cells[row][col].setHorizontalAlignment(JTextField.CENTER);
                cells[row][col].setFont(new Font("Arial", Font.BOLD, 18));
                cells[row][col].setBorder(BorderFactory.createLineBorder(Color.decode("#2973B2"), 1));

                // Alternating cell colors
                if ((row + col) % 2 == 0) {
                    cells[row][col].setBackground(Color.decode(COLOR_DEFAULT_EVEN));
                } else {
                    cells[row][col].setBackground(Color.decode(COLOR_DEFAULT_ODD));
                }
                gridPanel.add(cells[row][col]);
            }
        }

        // Buttons with custom styling
        JButton solveButton = createStyledButton("Solve", "#2973B2");
        solveButton.addActionListener(e -> solveSudoku());

        JButton checkButton = createStyledButton("Check", "#2973B2");
        checkButton.addActionListener(e -> checkSudoku());

        JButton loadButton = createStyledButton("Load", "#2973B2");
        loadButton.addActionListener(e -> loadSudoku());

        JButton saveButton = createStyledButton("Save", "#2973B2");
        saveButton.addActionListener(e -> saveSudoku());

        JButton resetButton = createStyledButton("Reset", "#2973B2");
        resetButton.addActionListener(e -> resetSudoku());

        // Button panel
        JPanel buttonPanel = new JPanel();
        buttonPanel.setBackground(Color.decode("#F2EFE7"));
        buttonPanel.add(loadButton);
        buttonPanel.add(saveButton);
        buttonPanel.add(solveButton);
        buttonPanel.add(checkButton);
        buttonPanel.add(resetButton);

        // Adding panels to frame
        frame.add(gridPanel, BorderLayout.CENTER);
        frame.add(buttonPanel, BorderLayout.SOUTH);
        frame.setSize(600, 700);
        frame.setVisible(true);
    }

    private JButton createStyledButton(String text, String color) {
        JButton button = new JButton(text);
        button.setFont(new Font("Arial", Font.BOLD, 18));
        button.setBackground(Color.decode(color));
        button.setForeground(Color.WHITE);
        button.setFocusPainted(false);
        button.setBorder(BorderFactory.createLineBorder(Color.decode("#2973B2"), 2));
        return button;
    }

    private void solveSudoku() {
        resetErrorColors();
        int[][] boardData = getBoardData();
        SudokuBoard board = new SudokuBoard(boardData);
        SudokuSolver solver = new SudokuSolver(board);

        if (solver.solve()) {
            for (int row = 0; row < BOARD_SIZE; row++) {
                for (int col = 0; col < BOARD_SIZE; col++) {
                    cells[row][col].setText(String.valueOf(board.getValue(row, col)));
                }
            }
            JOptionPane.showMessageDialog(frame, "Sudoku Solved!");
        } else {
            JOptionPane.showMessageDialog(frame, "No solution exists.");
        }
    }

    private void checkSudoku() {
        resetErrorColors();
        int[][] boardData = getBoardData();
        SudokuBoard board = new SudokuBoard(boardData);

        boolean hasErrors = false;

        // Highlight duplicates in rows
        for (int row = 0; row < BOARD_SIZE; row++) {
            if (board.hasDuplicateInRow(row)) {
                hasErrors = true;
                highlightRow(row);
            }
        }

        // Highlight duplicates in columns
        for (int col = 0; col < BOARD_SIZE; col++) {
            if (board.hasDuplicateInCol(col)) {
                hasErrors = true;
                highlightColumn(col);
            }
        }

        // Highlight duplicates in subgrids
        for (int row = 0; row < BOARD_SIZE; row += 3) {
            for (int col = 0; col < BOARD_SIZE; col += 3) {
                if (board.hasDuplicateInSubgrid(row, col)) {
                    hasErrors = true;
                    highlightSubgrid(row, col);
                }
            }
        }

        if (hasErrors) {
            JOptionPane.showMessageDialog(frame, "There are errors in your solution. Please fix them.", "Error", JOptionPane.ERROR_MESSAGE);
        } else {
            JOptionPane.showMessageDialog(frame, "Congratulations! No error found till now.", "Success", JOptionPane.INFORMATION_MESSAGE);
        }
    }

    private void highlightSubgrid(int startRow, int startCol) {
        for (int row = startRow; row < startRow + 3; row++) {
            for (int col = startCol; col < startCol + 3; col++) {
                cells[row][col].setBackground(Color.decode(COLOR_ERROR));
            }
        }
    }

    private void loadSudoku() {
        JFileChooser fileChooser = new JFileChooser();
        int result = fileChooser.showOpenDialog(frame);
        if (result == JFileChooser.APPROVE_OPTION) {
            File file = fileChooser.getSelectedFile();
            try (BufferedReader br = new BufferedReader(new FileReader(file))) {
                for (int row = 0; row < BOARD_SIZE; row++) {
                    String[] values = br.readLine().split(" ");
                    for (int col = 0; col < BOARD_SIZE; col++) {
                        cells[row][col].setText(values[col]);
                    }
                }
            } catch (IOException ex) {
                JOptionPane.showMessageDialog(frame, "Error loading file.", "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void saveSudoku() {
        JFileChooser fileChooser = new JFileChooser();
        int result = fileChooser.showSaveDialog(frame);
        if (result == JFileChooser.APPROVE_OPTION) {
            File file = fileChooser.getSelectedFile();
            try (BufferedWriter bw = new BufferedWriter(new FileWriter(file))) {
                for (int row = 0; row < BOARD_SIZE; row++) {
                    for (int col = 0; col < BOARD_SIZE; col++) {
                        bw.write(cells[row][col].getText().isEmpty() ? "0" : cells[row][col].getText());
                        if (col < BOARD_SIZE - 1) bw.write(" ");
                    }
                    bw.newLine();
                }
            } catch (IOException ex) {
                JOptionPane.showMessageDialog(frame, "Error saving file.", "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void resetSudoku() {
        resetErrorColors();
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                cells[row][col].setText("");
            }
        }
    }

    private void resetErrorColors() {
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                if ((row + col) % 2 == 0) {
                    cells[row][col].setBackground(Color.decode(COLOR_DEFAULT_EVEN));
                } else {
                    cells[row][col].setBackground(Color.decode(COLOR_DEFAULT_ODD));
                }
            }
        }
    }

    private void highlightRow(int row) {
        for (int col = 0; col < BOARD_SIZE; col++) {
            cells[row][col].setBackground(Color.decode(COLOR_ERROR));
        }
    }

    private void highlightColumn(int col) {
        for (int row = 0; row < BOARD_SIZE; row++) {
            cells[row][col].setBackground(Color.decode(COLOR_ERROR));
        }
    }

    private int[][] getBoardData() {
        int[][] boardData = new int[BOARD_SIZE][BOARD_SIZE];
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                String text = cells[row][col].getText();
                boardData[row][col] = text.isEmpty() ? 0 : Integer.parseInt(text);
            }
        }
        return boardData;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(NewSudoku::new);
    }
}