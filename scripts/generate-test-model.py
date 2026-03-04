#!/usr/bin/env python3
"""生成用于测试的简单 ONNX 模型"""
import numpy as np
import onnx
from onnx import helper, TensorProto

def create_embedding_model():
    """创建简单的代码嵌入模型 (输入: [1, 512] -> 输出: [1, 768])"""
    # 定义输入
    input_tensor = helper.make_tensor_value_info('input', TensorProto.FLOAT, [1, 512])

    # 定义输出
    output_tensor = helper.make_tensor_value_info('output', TensorProto.FLOAT, [1, 768])

    # 创建权重矩阵 (512 -> 768)
    weight = np.random.randn(512, 768).astype(np.float32) * 0.01
    weight_tensor = helper.make_tensor('weight', TensorProto.FLOAT, [512, 768], weight.flatten())

    # 创建偏置
    bias = np.zeros(768, dtype=np.float32)
    bias_tensor = helper.make_tensor('bias', TensorProto.FLOAT, [768], bias)

    # 创建 MatMul 节点
    matmul_node = helper.make_node('MatMul', ['input', 'weight'], ['matmul_out'])

    # 创建 Add 节点
    add_node = helper.make_node('Add', ['matmul_out', 'bias'], ['output'])

    # 创建图
    graph = helper.make_graph(
        [matmul_node, add_node],
        'code_embedding',
        [input_tensor],
        [output_tensor],
        [weight_tensor, bias_tensor]
    )

    # 创建模型
    model = helper.make_model(graph, producer_name='codepilot')
    model.opset_import[0].version = 13

    return model

if __name__ == '__main__':
    model = create_embedding_model()
    onnx.save(model, 'models/onnx/code-embedding.onnx')
    print('Generated code-embedding.onnx')
